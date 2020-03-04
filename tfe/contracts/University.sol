pragma solidity ^0.6.0;

import "./SubjectToken.sol";
import "./ECTSToken.sol";

/**
 * @dev El smart contract University representa una universidad dentro de la plataforma.
 * Puede crear nuevos tokens no fungibles llamados SubjectToken que representan a las diferentes asignaturas.
 * Tiene un deposito de tokens ECTSToken que transfieren los alumnos para poder matricularse en las asignaturas.
 */
contract University{
    
    //Campos de información privados
    address private _accountOwner; //Cuenta de universidad propietaria de la instancia
    string private _name; //Nombre de la universidad
    
    // Objectos privados que apuntan a los SC relacionados
    ECTSToken private _token;
    
    //Events
    event DepositRegistred(address _from, address _to, uint256 _amount);
    event EnrolledInSubject(address _to, address subject, uint256 tokenId);
    
    /**
     * @dev Inicializa el contrato apuntando a los SC que se relacionan con este.
     * @param accountOwner Dirección de la cuenta de universidad que será propietaria de esta instancia del smart contract
     * @param name Nombre de la universidad
     * @param scAddressToken Es la address del ECTSToken desplegado por la plataforma para los pagos
     */
    constructor(address accountOwner, string memory name, address scAddressToken) public{
        _accountOwner = accountOwner;
        _name = name;
        _token = ECTSToken(scAddressToken);
    }
    
    // Guardamos las asignaturas emitidas por la universidad
    address[] private _subjectsUniversity;
    mapping (address => bool) private _subjects;

    // Guardamos un deposito de tokens ECTSToken para cada estudiante que lo adquiere
    mapping (address => uint256 ) private _universityStudentBalances;

    /**
     * @dev Devuelve el nombre de la universidad.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Devuelve la cuenta propietaria de la instancia del smart contract
     */
    function accountOwner() public view returns (address) {
        return _accountOwner;
    }

    /*
    * @dev Modifier que se utiliza para comprobar que el msg.sender es la cuenta de universidad propietaria.
    */
    modifier onlyAccountOwner(){
        if(msg.sender==_accountOwner){
            _;
        }
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
     * @param account es la cuenta que se quiere comprob
     * @param price de la asignatura
     * @return bool Suciente o no
     */
    function enoughDeposit(address account, uint256 price) private view returns (bool){
        return (_universityStudentBalances[account] >= price);
    }
    
    /*
    * @dev Se despliega un nuevo token SubjectToken que representa una asignatura
    * Únicamente pueden llamar a este método universidades registradas en la plataforma
    * @param subjectname Nombre de la asignatura
    * @param symbol Símbolo que representa la asignatura
    * @param limitmint Número máximo de token que se pueden mintar de esta asignatura
    * @param expirationtime Tiempo unix en el que no podrán mintarse más tokens de esta asignatura
    * @param price Precio en ECTSToken por el que se vende la asignatura
    * @param descriptionURI Una URL que apuntará al temario de la asignatura. Se transferirá a todos los tokens mintados.
    * @return address La cuenta del nuevo token desplegado
    */
    function createSubject(string memory subjectname, string memory symbol, uint256 limitmint, uint256 expirationtime, uint256 price, string memory descriptionURI) public onlyAccountOwner returns (address) {
        SubjectToken _subjectToken = new SubjectToken(subjectname, symbol, limitmint, expirationtime, price, descriptionURI);
        _subjectsUniversity.push(address(_subjectToken));
        _subjects[address(_subjectToken)]=true;
        return (address(_subjectToken));
    }
    
    /*
    * @dev Recupera una lista de las asignaturas publicadas por la universidad
    * @return address[] Array con las cuentas de las asignaturas
    */
    function getSubjects() public view returns(address[] memory){
        return _subjectsUniversity;
    }
    
    /*
    * @dev Se depositan tokens ECTSToken en un deposito particular del alumno en esta universidad
    * Se emite un evento {DepositRegistred}
    * @param amountTokens Cantidad de tokens que se quieren depositar
    */
    function makeAnIncome(uint amountTokens) public{
        // Añade los tokens indicados en el depósito del alumno
        _universityStudentBalances[msg.sender] += amountTokens;

        // Transfiere los tokens propiedad del alumno de su cuenta a la de esta universidad.
        // Antes de llamar a este método el alumno deberá haber aprobado la cuenta de esta universidad para la cantidad de tokens que quiere transferir
        _token.transferFrom(msg.sender, address(this), amountTokens);
        emit DepositRegistred(msg.sender, address(this), amountTokens);
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
        require(enoughDeposit(msg.sender, sub.price()), "University: Not enough tokens in deposit.");
        uint256 tokenId = sub.mint(msg.sender);
        emit EnrolledInSubject(msg.sender, accountSubject, tokenId);
        return tokenId;
    }
}