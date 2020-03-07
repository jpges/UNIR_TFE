pragma solidity ^0.6.0;

import "./SubjectToken.sol";
import "./ECTSToken.sol";
import "./openzeppelin/ownership/Ownable.sol";
import "./openzeppelin/math/SafeMath.sol";

/**
 * @dev El smart contract University representa una universidad dentro de la plataforma.
 * Puede crear nuevos tokens no fungibles llamados SubjectToken que representan a las diferentes asignaturas.
 * Tiene un deposito de tokens ECTSToken que transfieren los alumnos para poder matricularse en las asignaturas.
 */
contract University is Ownable{
    using SafeMath for uint256;

    struct StructDeposit {
        address accountstudent;
        string studentname;
        uint256 balance;
    }

    //Campos de información privados
    string private _name; //Nombre de la universidad
    
    // Objectos privados que apuntan a los SC relacionados
    address private _addrtoken;
    
    //Events
    event PublishNewSubject(string subjectname, address accountSCSubject);
    event DepositRegistred(address _from, address _to, uint256 _amount);
    event EnrolledInSubject(address _to, address subject, uint256 tokenId);
    
    /**
     * @dev Inicializa el contrato apuntando a los SC que se relacionan con este.
     * @param name Nombre de la universidad
     * @param scAddressToken Es la address del ECTSToken desplegado por la plataforma para los pagos
     */
    constructor(string memory name, address scAddressToken) public{
        _name = name;
        _addrtoken = scAddressToken;
    }
    
    // Guardamos las asignaturas emitidas por la universidad
    address[] private _subjectsUniversity;
    mapping (address => bool) private _subjects;

    // Guardamos un deposito de tokens ECTSToken para cada estudiante que lo adquiere
    address[] private _deposits;
    mapping (address => StructDeposit ) private _universityStudentBalances;

    /**
     * @dev Devuelve el nombre de la universidad.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Indica si la cuenta recibida por parámetro representa una instancia de SubjectToken registrado por esta universidad
     * @param account es la cuenta que se quiere comprobar
     * @return bool Indica si es o no una cuenta registrada
     */
    function isPublisedSubject(address account) private view returns (bool){
        return _subjects[account];
    }
    
    /**
     * @dev Indica si el deposito existente de una cuenta es superior al precio recibido
     * @param account es la cuenta que se quiere comprobar
     * @param price de la asignatura
     * @return bool Suciente o no
     */
    function enoughDeposit(address account, uint256 price) private view returns (bool){
        return (_universityStudentBalances[account].balance >= price);
    }
    
    /*
    * @dev Se despliega un nuevo token SubjectToken que representa una asignatura
    * Únicamente puede llamar la universidad propietaria del smart contract
    * @param subjectname Nombre de la asignatura
    * @param symbol Símbolo que representa la asignatura
    * @param limitmint Número máximo de token que se pueden mintar de esta asignatura
    * @param expirationtime Tiempo unix en el que no podrán mintarse más tokens de esta asignatura
    * @param price Precio en ECTSToken por el que se vende la asignatura
    * @param descriptionURI Una URL que apuntará al temario de la asignatura. Se transferirá a todos los tokens mintados.
    * @return address La cuenta del nuevo token desplegado
    */
    function createSubject(string memory subjectname, string memory symbol, uint256 limitmint,
        uint256 expirationtime, uint256 price, string memory descriptionURI) public onlyOwner returns (address) {
        SubjectToken _subjectToken = new SubjectToken(subjectname, symbol, limitmint, expirationtime, price, descriptionURI);
        _subjectsUniversity.push(address(_subjectToken));
        _subjects[address(_subjectToken)] = true;
        emit PublishNewSubject(subjectname,address(_subjectToken));
        return (address(_subjectToken));
    }
    
    /*
    * @dev Recupera una lista de las asignaturas publicadas por la universidad
    * @return address[] Array con las direcciones de las asignaturas
    */
    function getSubjects() public view returns(address[] memory){
        return _subjectsUniversity;
    }
    
    /*
    * @dev Recupera una lista de los depositos que tiene
    * @return address[] Array con las cuentas de los depositos
    */
    function getDeposits() public view returns(address[] memory){
        return _deposits;
    }
    
    /*
    * @dev Recupera la información de una asignatura de la universidad
    * @return (string, uint256) Información del deposito
    */
    function getDeposit(address account) public view returns(string memory, uint256) {
        return (_universityStudentBalances[account].studentname, _universityStudentBalances[account].balance);
    }
    
    /*
    * @dev Se depositan tokens ECTSToken en un deposito particular del alumno en esta universidad
    * Se emite un evento {DepositRegistred}
    * @param amountTokens Cantidad de tokens que se quieren depositar
    */
    function makeAnIncome(string memory studentname, uint amountTokens) public{
        // Añade los tokens indicados en el depósito del alumno
        _universityStudentBalances[_msgSender()].accountstudent = _msgSender();
        _universityStudentBalances[_msgSender()].studentname = studentname;
        _universityStudentBalances[_msgSender()].balance = (_universityStudentBalances[_msgSender()].balance).add(amountTokens);
        _deposits.push(_msgSender());

        // Transfiere los tokens propiedad del alumno de su cuenta a la de esta universidad.
        // Antes de llamar a este método el alumno deberá haber aprobado la cuenta de esta universidad para la cantidad de tokens que quiere transferir
        ECTSToken _token = ECTSToken(_addrtoken);
        _token.transferFrom(_msgSender(), owner(), amountTokens);
        emit DepositRegistred(_msgSender(), owner(), amountTokens);
    }
    
    /*
    * @dev Matricula a un alumno en una asignatura
    * Primero verifica que la asignatura en la que quiere matricularse existe
    * Se emite un evento {EnrolledInSubject}
    * @param accountSubject Cuenta de la asignatura en la que quiere matricularse
    */
    function enrollInSubject(address accountSubject) public returns (uint256){
        require(isPublisedSubject(accountSubject), "University: accountSubject not found.");
        SubjectToken sub = SubjectToken(accountSubject);
        require(enoughDeposit(_msgSender(), sub.price()), "University: Not enough tokens in deposit.");
        uint256 tokenId = sub.mint(_msgSender());
        emit EnrolledInSubject(_msgSender(), accountSubject, tokenId);
        return tokenId;
    }
}