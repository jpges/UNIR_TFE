pragma solidity ^0.5.0;

import "./ECTSToken.sol";
import "../node_modules/@openzeppelin/contracts/ownership/Ownable.sol";

/**
 * @dev El smart contract UniversityPlatform representa la administración general de todo el sistema.
 * Se encarga de desplegar cosas necesarias como el token que representa a los ECTS y los Smartcontracts
 * que dan acceso y funcionalidad a universidades y alumnos.
 *
 */
contract UniversityPlatform is Ownable{
    using SafeMath for uint256;
    
    //Events
    event BuyTokens(uint256 amount, uint256 priceOfOneTokenInWei, address msgsender);
    event NewPrice(uint256 tokenpricewei);
    event UniversityRegistred(address account);
    event StudentRegistred(address account);
    
    // Smartcontracts relacionados
    ECTSToken private _token;
    
    //Precio de un token en wei
    uint256 private _priceOfOneTokenInWei;
  
    //Total tokens vendidos en wei
    uint256 private _weiRaised;
    
    // Guardamos la información de las universidades como un mapping de cuentas contra las instancias del Smartcontracts university
    mapping(address => address) private _universities;
    // Listado rápido de todas los address de las universidades
    address[] private _listUniversities;
    
    // Guardamos la información de los almunos como un mapping de cuentas contra las instancias del Smartcontracts student
    mapping(address => address) private _students;
    // Listado rápido de todas los address de los estudiantes registrados
    address[] private _listStudents;

    /**
     * @dev Inicializa el contrato desplegando el token ECTSToken.
     * También establece el precio inicial que queremos poner a los ECTS, pero posteriormente se puede cambiar manualmente.
     */
    constructor() public {
        _token = new ECTSToken(); //Creamos el nuevo token que vamos a intercambiar
        _priceOfOneTokenInWei=((76/100) * 10**18); //Inicialmente establezco el valor en 0,76 ETHER que son unos 150€
    }
    
    function getECTSTokenAddress() public view onlyOwner returns (address){
        return address(_token);
    }
    
    /**
     * @dev La función se utiliza para registrar nuevas universidades en la plataforma.
     * Emite un evento {UniversityRegistred} con `account` de la nueva universidad registrada.
     * @param accountUniversity Cuenta de la universidad que se registra
     * @param accountSCUniversity Cuenta del smart contract propiedad de la universidad y que la representa
     */
    function registerUniversity(address accountUniversity, address accountSCUniversity) public onlyOwner{ 
        _universities[accountUniversity] = accountSCUniversity;
        _listUniversities.push(accountUniversity);
        emit UniversityRegistred(accountUniversity);
    }
    
    /**
     * @dev La función se utiliza para registrar nuevos estudiantes en la plataforma.
     * Emite un evento {StudentRegistred} con el `account` del nuevo estudiante registrado.
     * @param accountStudent Cuenta del estudiante que se registra
     * @param accountSCStudent Cuenta del smart contract propiedad del estudiante y que la representa
     */
    function registerStudent(address accountStudent, address accountSCStudent) public onlyOwner{
        _students[accountStudent] = accountSCStudent;
        _listStudents.push(accountStudent);
        emit StudentRegistred(accountStudent);
    }
    
    /**
     * @dev Cuando se llama al contract sin método y con ether se ejecutará este método.
     */
    function() external payable {
        buyTokens(msg.sender);
    }
    
    /*
    * @dev Modifier que se utiliza para comprobar que el _msgSender() es una cuenta registrada, universidad o alumno, en la
    * plataforma o la propia cuenta gestora.
    */
    modifier onlyRegistredUser(){
        if((_universities[_msgSender()] != address(0x0)) || (_students[_msgSender()] != address(0x0)) || (_msgSender() == owner())){
            _;
        }
    }
    
    /*
    * @dev Para obtener una lista con todas las direcciones de empresas en la que iterar
    */
    function getUniversities() public view onlyRegistredUser returns (address[] memory) {
        return _listUniversities;
    }
    
    /*
    * @dev Recupera la dirección del smart contract de una universidad asociada
    */
    function getUniversity(address accountUniversity) public view onlyRegistredUser returns (address) {
        return _universities[accountUniversity];
    }
    
    /*
    * @dev Para obtener una lista con todas las direcciones de estudiantes registrados
    */
    function getStudents() public view onlyRegistredUser returns (address[] memory) {
        return _listStudents;
    }
    
    /*
    * @dev Recupera la dirección del smart contract de un estudiante asociado
    * @param Cuenta del estudiante
    * @return address de la cuenta del SC asociado
    */
    function getStudent(address accountStudent) public view onlyRegistredUser returns (address) {
        return _students[accountStudent];
    }
  
    /**
     * @dev Es la función que sirve para comprar tokens por parte del estudiante.
     * Requiere que el que compra sea un estudiante registrado en la plataforma.
     * Emite un evento {BuyTokens} con `tokens` comprados al precio {priceOfOneTokenInWei} por {beneficiary}.
     * Los tokens se mintan en el momento en el que son adquiridos.
     * @param beneficiary Es la cuenta que adquiere los tokens
     */
    function buyTokens(address beneficiary) public payable {
        require(beneficiary != address(0), "buyTokens: Beneficiary is account 0.");
        require(msg.value != 0, "buyTokens: value is 0.");
        require((_students[beneficiary] != address(0)), "buyTokens: beneficiary isn't registred."); //Requerir que el que compra esté registrado como estudiante en la plataforma.

        uint256 amounttokens = msg.value.div(_priceOfOneTokenInWei);
        _weiRaised = _weiRaised.add(msg.value);
    
        _token.mint(owner(), amounttokens); //Generamos los tokens a medida que los vamos necesitando
        _token.transfer(beneficiary, amounttokens);
        emit BuyTokens(amounttokens, _priceOfOneTokenInWei, beneficiary);
    }
  
    /**
     * @dev Establece el precio al que se venderá el token ECTSToken.
     * Emite un evento {NewPrice} con `tokenpricewei` indicando el nuevo precio del token
     * @param tokenpricewei Precio del token en wei
     */
    function setTokenPrice(uint256 tokenpricewei) public onlyOwner{
        _priceOfOneTokenInWei = tokenpricewei;
        emit NewPrice(tokenpricewei);
    }

}