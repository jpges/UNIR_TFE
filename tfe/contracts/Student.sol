pragma solidity ^0.6.0;

import "./UniversityPlatform.sol";
import "./University.sol";
import "./SubjectToken.sol";
import "./ECTSToken.sol";
import "./openzeppelin/ownership/Ownable.sol";

/**
 * @dev El SM Students se encarga de la gestión de los estudiantes.
 * El estudiante comprará ECTSToken que luego intercambiará por matriculas en asignaturas mediante un deposito en la universidad
 */
contract Student is Ownable {
    using SafeMath for uint256;
    
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
    string private _name; //Nombre del estudiante


    // Objectos privados que apuntan a los SC relacionados
    ECTSToken private _token;
    UniversityPlatform private _univPlatform;
    
    
    /**
     * @dev Inicializa el contrato apuntando a los SC que se relacionan con este.
     * @param name Nombre del estudiante
     * @param scAddressToken Es la address del ECTSToken desplegado por la plataforma para los pagos
     */
    constructor(string memory name, address scAddressToken) public{
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
    
    /*
    * @dev Recupera una lista de las asignaturas en las que el alumno está matriculado
    * @return address[] Array con las cuentas de las asignaturas en las que está matriculado
    */
    function getSubjectsInWitchEnrolled() public view returns(address[] memory){
        return _subjectsInWitchEnrolled;
    }

    /*
    * @dev Se depositan tokens ECTSToken en un deposito particular de este alumno en la universidad que se indica
    * Se restringe el método únicamente a la cuenta del estudiante propietario de esta instancia del contract
    * @param accountSCUniversity Cuenta del smartcontract de la universidad a la que queremos transferir los tokens
    * @param amountTokens Cantidad de tokens que se quieren depositar
    */
    function makeAnIncome(address accountSCUniversity, uint amountTokens) public onlyOwner returns (bool){
        // Marcamos la cuenta de la universidad como aprobada para transferir la cantidad de tokens indicada
        _token.approve(accountSCUniversity, amountTokens);
        
        // Reconstruimos el enlace con la universidad y le decimos que se transfiera ahora los tokens
        University univ = University(accountSCUniversity);
        univ.makeAnIncome(_name, amountTokens);
        
        // Guarda en el registro de depositos la información
        require(addDeposit(accountSCUniversity,amountTokens));
        
        return true;
    }
    
    /*
    * @dev Función privada que añade una estructura deposito si no existe ya
    * @param accountUniversity Cuenta de la universidad a la que queremos transferir los tokens
    * @param amountTokens Cantidad de tokens que se quieren depositar
    */
    function addDeposit(address accountSCUniversity, uint amountTokens) private returns (bool){
        if (!_universityDepositBalance[accountSCUniversity].exists){
            _universitiesWithDeposit[_totalDeposits] = accountSCUniversity;
            _totalDeposits++;
        }
        _universityDepositBalance[accountSCUniversity].exists = true;
        _universityDepositBalance[accountSCUniversity].balance += amountTokens; 
        return true;
    } 
    
    /*
    * @dev Devuelve un array de direcciones de universidades en las que se tiene deposito
    * Las llamadas únicamente las puede realizar el propietario de esta cuenta de estudiante
    */
    function getUniversitiesWithDeposit() public view onlyOwner returns (address[] memory){
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
    function getDepositInUniversity(address scuniv) public view onlyOwner returns (uint256){
        if (_universityDepositBalance[scuniv].exists){
            return _universityDepositBalance[scuniv].balance;
        }
        else{
            return 0;
        }
    }
    
    /*
    * @dev Matricula al alumno en una asignatura
    * Únicamente se puede llamar a este método desde la propia cuenta del estudiante
    * Primero verifica que no esté ya matriculado
    * @param accountSCUniversity Cuenta de la asignatura universidad que ofrece la asignatura
    * @param accountSCSubject Cuenta de la asignatura en la que quiere matricularse
    * @returns uint256 TokenId, el identificador que representa su matrícula
    */
    function enrollInSubject(address accountSCUniversity, address accountSCSubject) public onlyOwner returns (uint256){
        require(!_subjectsEnrollements[accountSCSubject].exists, "University: Student is already enrolled.");
        University univ = University(accountSCUniversity);
        uint256 tokenId = univ.enrollInSubject(accountSCSubject);
        _subjectsInWitchEnrolled.push(accountSCSubject);
        _subjectsEnrollements[accountSCSubject].tokenid = tokenId;
        _subjectsEnrollements[accountSCSubject].exists = true;
        return tokenId;
    }
    
}
