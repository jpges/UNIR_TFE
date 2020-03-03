pragma solidity 0.6.1;

import "./UniversityPlatform.sol";
import "./SubjectToken.sol";
import "./ECTSToken.sol";
import "./openzeppelin/GSN/Context.sol";

/**
 * @dev El smart contract Universities se encarga de la gestión de las universidades.
 * Puede crear nuevos tokens no fungibles llamados SubjectToken que representan a las diferentes asignaturas.
 *
 */
contract Universities is Context{
    
    /*
    * @dev Struct que almacena la información de una universidad
    */
    struct University {
      address account;
      string name;
      bool isValue; // Lo utilizaremos para comprobar que la universidad existe
    }
    
    // Objectos privados que apuntan a los SC relacionados
    ECTSToken private _token;
    UniversityPlatform private _univPlatform;
    
    //Events
    event UniversityRegistred(address account);
    event DepositRegistred(address _from, address _to, uint256 _amount);
    
    /**
     * @dev Inicializa el contrato apuntando a los SC que se relacionan con este.
     * @param addressUnivPlatform Es una address payable que apunta al SC que administra toda la plataforma
     * @param addressToken Es la address del ECTSToken desplegado por la plataforma para los pagos
     */
    constructor(address payable addressUnivPlatform, address addressToken) public{
        _token = ECTSToken(addressToken);
        _univPlatform = UniversityPlatform(addressUnivPlatform);
    }
    
    // Guardamos la información de las universidades como un mapping de cuentas contra la información
    mapping(address => University) private _universities;
    // Listado rápido de todas los address de las universidades
    address[] private _listUniversities;
    // Guardamos las asignaturas emitidas por cada universidad
    mapping(address => address[]) _subjectsUniversity;
    // Guardamos un deposito de tokens ECTSToken para cada estudiante
    mapping (address => mapping(address => uint256 )) public universityStudentBalances;
    
    /**
     * @dev La función se utiliza para registrar nuevas universidades en la plataforma.
     * Emite un evento {UniversityRegistred} con `account` de la nueva universidad registrada.
     * @param account Cuenta de la universidad que queremos registrar en la plataforma
     * @param name Nombre de la universidad
     */
    function registerUniversity(address account, string memory name) public {
        
        // Se anade a la tabla general de empresas
        _universities[account] = University(account, name, true);
        
        // se anade a la lista de direcciones de empresas
        _listUniversities.push(account);
        
        emit UniversityRegistred(account);
        
    }
    
    /*
    * @dev Modifier que se utiliza para comprobar que el _msgSender() es una cuenta de universidad registrada.
    */
    modifier onlyRegistredUniversity(){
        if(_universities[_msgSender()].isValue){
            _;
        }
    }
    
    /*
    * @dev Devuelve si una cuenta es de una universidad registrada o no
    * @param univ Cuenta de la universidad que queremos comprobar si está registrada
    * @return bool Si está registrada o no.
    */
    function isRegistredUniversity(address univ) public view returns (bool){
        return _universities[univ].isValue;
    }
    
    /*
    * @dev Modifier que se utiliza para comprobar que el _msgSender() es una cuenta registrada, universidad o alumno, en la
    * plataforma o la propia cuenta gestora.
    */
    modifier onlyRegistredUser(){
        if(_univPlatform.isRegistredUser(_msgSender())){
            _;
        }
    }
    
    /*
    * Para obtener una lista con todas las direcciones de empresas en la que iterar
    */
    function getUniversities() public view onlyRegistredUser returns (address[] memory) {
        return _listUniversities;
    }

    /*
    * Para obtener la informacion del nombre de una universidad a partir de su direccion
    */
    function getUniversityName(address account) public view onlyRegistredUser returns (string memory){
        return _universities[account].name;
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
    function createSubject(string memory subjectname, string memory symbol, uint256 limitmint, uint256 expirationtime, uint256 price, string memory descriptionURI) public onlyRegistredUniversity returns (address) {
        //Probablemente esto habrá que hacerlo desde el javascript con la cuenta de la universidad porque sino no sé quien será el propietario. Hay que asegurar que el propietario del token
        //es la universidad que lo crea y no este SM. A lo mejor se puede hacer aquí lo del from
        SubjectToken _subjectToken = new SubjectToken(subjectname, symbol, limitmint, expirationtime, price, descriptionURI);
        _subjectsUniversity[_msgSender()].push(address(_subjectToken));
        return (address(_subjectToken));
    }
    
    /*
    * @dev Recupera una lista de las asignaturas publicadas por una universidad
    * Se restringe el uso únicamente a usuarios registrados en la plataforma.
    * @param univ Cuenta de la universidad en la que se quiere hacer el deposito
    * @return address[] Array con las cuentas de las asignaturas
    */
    function getSubjects(address univ) public view onlyRegistredUser returns(address[] memory){
        return (_subjectsUniversity[univ]);
    }
    
    /*
    * @dev Se depositan tokens ECTSToken en un deposito particular del alumno en la universidad que se indica
    * Se restringe el uso únicamente a usuarios registrados en la plataforma.
    * Se emite un evento {DepositRegistred}
    * @param univ Cuenta de la universidad en la que se quiere hacer el deposito
    * @param amountTokens Cantidad de tokens que se quieren depositar
    */
    function deposit(address univ, uint amountTokens) public onlyRegistredUser{
        // Añade los tokens indicados en el depósito del alumno
        universityStudentBalances[univ][msg.sender]+= amountTokens;

        // Transfiere los tokens propiedad del alumno de su cuenta a la de la universidad en la que quiere matricularse.
        // Antes de llamar a este método el alumno deberá haber aprobado la cuenta de la universidad
        _token.transferFrom(msg.sender, univ, amountTokens);
        emit DepositRegistred(msg.sender, univ, amountTokens);
    }

    //TODO: Matricular en una asignatura
    //viene de la cuenta del estudiante
    //verifica si el estudiante tiene suficiente deposito
    //En caso de que sí. Minta y transfiere el token de la asignatura a ese estudiante
}