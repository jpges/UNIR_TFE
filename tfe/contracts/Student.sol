pragma solidity ^0.5.0;

import "./University.sol";
import "./SubjectToken.sol";
import "./ECTSToken.sol";
import "../node_modules/@openzeppelin/contracts/ownership/Ownable.sol";

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
    
    //Events
    event StudentDepositRegistred(address _from, address _to, uint256 _amount);
    
    //Estructura para guardar matriculas
    struct Enrollement{
        uint256 tokenid;
        bool exists;
    }
    
    //Campos de información privados
    string private _name; //Nombre del estudiante


    // Objectos privados que apuntan a los SC relacionados
    ECTSToken private _token;
    
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
    * @dev Recupera el tokenid de la matricula del alumno
    ] @param accountSCSubject es la cuenta del smart contract que representa la asignatura
    * @return uint256 Tokenid de la matricula del alumno
    */
    function getEnrollementTokenId(address accountSCSubject) public view returns(uint256){
        return _subjectsEnrollements[accountSCSubject].tokenid;
    }

    /*
    * @dev Registra el depósito realizado y llama a la universidad para que se adueñe de los tokens
    * Se restringe el método únicamente a la cuenta del estudiante propietario de esta instancia del contract
    * @param accountSCUniversity Cuenta del smartcontract de la universidad a la que queremos transferir los tokens
    * @param amountTokens Cantidad de tokens que se quieren depositar
    */
    function addDeposit(string memory studentname, address accountSCUniversity, uint amountTokens) public onlyOwner returns (bool){
        // Reconstruimos el enlace con la universidad y le decimos que se transfiera ahora los tokens
        University univ = University(accountSCUniversity);
        if (univ.makeAnIncome(owner(), studentname, amountTokens)){
            //Añadimos el deposito
            if (!_universityDepositBalance[accountSCUniversity].exists){
                _universityDepositBalance[accountSCUniversity].balance = 0;
                _universitiesWithDeposit[_totalDeposits] = accountSCUniversity;
                _totalDeposits++;
            }
            _universityDepositBalance[accountSCUniversity].exists = true;
            _universityDepositBalance[accountSCUniversity].balance = (_universityDepositBalance[accountSCUniversity].balance).add(amountTokens);
            
            emit StudentDepositRegistred(owner(), accountSCUniversity, amountTokens);
            return true;
        }else{
            return false;
        }
    } 
    
    /*
    * @dev Devuelve un array de direcciones de universidades en las que se tiene deposito
    * Las llamadas únicamente las puede realizar el propietario de esta cuenta de estudiante
    */
    function getUniversitiesWithDeposit() public view onlyOwner returns (address[] memory){
        address[] memory _univs = new address[](_totalDeposits);
        for(uint i = 0 ; i<_totalDeposits; i++) {
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
    * @dev Guarda en la cuenta del alumno las asignaturas en las que está matriculado
    * Únicamente se puede llamar a este método desde la propia cuenta del estudiante
    * @param accountSCUniversity Cuenta de la universidad en la que nos hemos matriculado
    * @param accountSCSubject Cuenta de la asignatura en la que quiere matricularse
    * @param tokenId, el identificador que representa su matrícula
    * @returns bool true si todo va bien
    */
    function recordEnrollInSubject(address accountSCUniversity, address accountSCSubject, uint256 tokenId) public onlyOwner returns (bool){
        _subjectsInWitchEnrolled.push(accountSCSubject);
        _subjectsEnrollements[accountSCSubject].tokenid = tokenId;
        _subjectsEnrollements[accountSCSubject].exists = true;
        
        SubjectToken subj = SubjectToken(accountSCSubject);
        _universityDepositBalance[accountSCUniversity].balance = (_universityDepositBalance[accountSCUniversity].balance).sub(subj.price());
        return true;
    }
    
}
