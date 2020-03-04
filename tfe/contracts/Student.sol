pragma solidity 0.6.0;

import "./UniversityPlatform.sol";
import "./SubjectToken.sol";
import "./ECTSToken.sol";
import "./openzeppelin/GSN/Context.sol";

/**
 * @dev El SM Students se encarga de la gestión de los estudiantes.
 * El estudiante comprará ECTSToken que luego intercambiará por matriculas en asignaturas mediante un deposito en la universidad
 */
contract Student is Context {
    
    //Estructura para guardar depositos
    struct Deposit{
        uint256 balance;
        bool exists;
    }
    
    //Estructura para guardar matriculas
    struct Enrollement{
        uint256 tokenid;
        bool exists;
    }
    
    //Campos de información privados
    address private _accountOwner; //Cuenta de estudiante propietaria de la instancia
    string private _name; //Nombre del estudiante


    // Objectos privados que apuntan a los SC relacionados
    ECTSToken private _token;
    UniversityPlatform private _univPlatform;
    
    
    /**
     * @dev Inicializa el contrato apuntando a los SC que se relacionan con este.
     * @param accountOwner Dirección de la cuenta del estudiante que será propietario de esta instancia del smart contract
     * @param name Nombre del estudiante
     * @param scAddressToken Es la address del ECTSToken desplegado por la plataforma para los pagos
     */
    constructor(address accountOwner, string memory name, address scAddressToken) public{
        _accountOwner = accountOwner;
        _name = name;
        _token = ECTSToken(scAddressToken);
        _totalDeposits = 0;
    }
    
    // Guardamos las asignaturas en las que el estudiante está matriculado
    address[] private _subjectsInWitchEnrolled;
    mapping (address => Enrollement) private _subjectsEnrollements;
    
    // Guardamos el deposito de tokens ECTSToken que tenemos en cada universidad
    mapping (address => Deposit) private _universityDepositBalance;
    mapping (uint => address) private _universitiesWithDeposit;
    uint256 private _totalDeposits;
    
    /**
     * @dev Devuelve el nombre del estudiante
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Devuelve la cuenta propietaria de la instancia del smart contract
     */
    function accountOwner() private view returns (address) {
        return _accountOwner;
    }
    
    /*
    * @dev Recupera una lista de las asignaturas en las que el alumno está matriculado
    * @return address[] Array con las cuentas de las asignaturas en las que está matriculado
    */
    function getSubjectsInWitchEnrolled() public view returns(address[] memory){
        return _subjectsInWitchEnrolled;
    }

    /*
    * @dev Modifier que se utiliza para comprobar que el msg.sender es la cuenta de universidad propietaria.
    */
    modifier onlyAccountOwner(){
        if(msg.sender==_accountOwner){
            _;
        }
    }
    
    /*
    * @dev Se depositan tokens ECTSToken en un deposito particular de este alumno en la universidad que se indica
    * Se restringe el método únicamente a la cuenta del estudiante propietario de esta instancia del contract
    * @param accountUniversity Cuenta de la universidad a la que queremos transferir los tokens
    * @param amountTokens Cantidad de tokens que se quieren depositar
    */
    function makeAnIncome(address accountUniversity, uint amountTokens) public onlyAccountOwner returns (bool){
        // Marcamos la cuenta de la universidad como aprobada para transferir la cantidad de tokens indicada
        _token.approve(accountUniversity, amountTokens);
        
        // Reconstruimos el enlace con la universidad y le decimos que se transfiera ahora los tokens
        University univ = University(accountUniversity);
        univ.makeAnIncome(amountTokens);
        
        // Guarda en el registro de depositos la información
        require(addDeposit(accountUniversity,amountTokens));
        
        return true;
    }
    
    /*
    * @dev Función privada que añade una estructura deposito si no existe ya
    * @param accountUniversity Cuenta de la universidad a la que queremos transferir los tokens
    * @param amountTokens Cantidad de tokens que se quieren depositar
    */
    function addDeposit(address accountUniversity, uint amountTokens) private returns (bool){
        if (!_universityDepositBalance[accountUniversity].exists){
            _universitiesWithDeposit[_totalDeposits] = accountUniversity;
            _totalDeposits++;
        }
        _universityDepositBalance[accountUniversity].exists = true;
        _universityDepositBalance[accountUniversity].balance += amountTokens; 
        return true;
    } 
    
    /*
    * @dev Devuelve un array de direcciones de universidades en las que se tiene deposito
    * Las llamadas únicamente las puede realizar el propietario de esta cuenta de estudiante
    */
    function getUniversitiesWithDeposit() public view onlyAccountOwner returns (address[] memory){
        address[] memory _univs; new address[](_totalDeposits + 1);
        for(uint i = 0 ; i<=_totalDeposits; i++) {
            _univs[i] = _universitiesWithDeposit[i];
        }
        return _univs;
    }
    
    /*
    * @dev Devuelve la cantidad de tokens que se tienen en el deposito de una universidad
    * Las llamadas únicamente las puede realizar el propietario de esta cuenta de estudiante
    */
    function getDepositInUniversity(address univ) public view onlyAccountOwner returns (uint256){
        if (_universityDepositBalance[univ].exists){
            return _universityDepositBalance[univ].balance;
        }
        else{
            return 0;
        }
    }
    
    /*
    * @dev Matricula al alumno en una asignatura
    * Únicamente se puede llamar a este método desde la propia cuenta del estudiante
    * Primero verifica que no esté ya matriculado
    * @param accountUniversity Cuenta de la asignatura universidad que ofrece la asignatura
    * @param accountSubject Cuenta de la asignatura en la que quiere matricularse
    * @returns uint256 TokenId, el identificador que representa su matrícula
    */
    function enrollInSubject(address accountUniversity, address accountSubject) public onlyAccountOwner returns (uint256){
        require(!_subjectsEnrollements[accountSubject].exists, "University: Student is already enrolled.");
        University univ = University(accountUniversity);
        uint256 tokenId = univ.enrollInSubject(accountSubject);
        _subjectsInWitchEnrolled.push(accountSubject);
        _subjectsEnrollements[accountSubject].tokenid = tokenId;
        _subjectsEnrollements[accountSubject].exists = true;
        return tokenId;
    }
    
}
