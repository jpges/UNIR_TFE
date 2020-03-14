pragma solidity ^0.5.0;

import "./ECTSToken.sol";
import "../node_modules/@openzeppelin/contracts/ownership/Ownable.sol";

/**
 * @dev El smart contract UniversityPlatform representa la administración general de todo el sistema.
 * Se encarga de desplegar cosas necesarias como el token que representa a los ECTS y los Smartcontracts
 * que dan acceso y funcionalidad a universidades y alumnos.
 *
 */
contract UniversityPlatform is Ownable {
    using SafeMath for uint256;

    //Events
    event BuyTokens(
        uint256 amount,
        uint256 priceOfOneTokenInWei,
        address msgsender
    );
    event NewPrice(uint256 tokenpricewei);
    event NewPriceForRefund(uint256 tokenpriceweiforrefund);
    event UniversityRegistred(address account);
    event studentRegistred(address account);
    event RefuntECTS(address _from, address _to, uint256 _amount);

    // Smartcontracts relacionados
    ECTSToken private _token;

    //Precio de un token en wei a la venta
    uint256 private _priceOfOneTokenInWei;

    //Precio de un token cuando se reembolsa
    //El modelo de negocio se basa en la diferencia de precio entre la compra y la venta, la diferencia es lo que se queda la plataforma
    uint256 private _priceOfOneTokenInWeiForRefund;

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
     * @param addressSCECTSToken la dirección donde está el ECTSTOken desplegado
     * También establece el precio inicial que queremos poner a los ECTS, pero posteriormente se puede cambiar manualmente.
     */
    constructor(address addressSCECTSToken) public {
        _token = ECTSToken(addressSCECTSToken); //Apuntamos al ECTSToken
        _priceOfOneTokenInWei = ((76 / 100) * 10**18); //Inicialmente establezco el valor en 0,76 ETHER que son unos 150€. Este valor puede modificarse posteriormente.
        _priceOfOneTokenInWeiForRefund = ((56 / 100) * 10**18); //Inicialmente establezco el valor en 0,56 ETHER que son unos 110€. Este valor puede modificarse posteriormente.
    }

    function getECTSTokenAddress() public view onlyOwner returns (address) {
        return address(_token);
    }

    /**
     * @dev La función se utiliza para registrar nuevas universidades en la plataforma.
     * Emite un evento {UniversityRegistred} con `account` de la nueva universidad registrada.
     * @param accountUniversity Cuenta de la universidad que se registra
     * @param accountSCUniversity Cuenta del smart contract propiedad de la universidad y que la representa
     */
    function registerUniversity(
        address accountUniversity,
        address accountSCUniversity
    ) public onlyOwner {
        _universities[accountUniversity] = accountSCUniversity;
        _listUniversities.push(accountUniversity);
        emit UniversityRegistred(accountUniversity);
    }

    /**
     * @dev La función se utiliza para registrar nuevos estudiantes en la plataforma.
     * Emite un evento studentRegistred con el `account` del nuevo estudiante registrado.
     * @param accountStudent Cuenta del estudiante que se registra
     * @param accountSCStudent Cuenta del smart contract propiedad del estudiante y que la representa
     */
    function registerStudent(address accountStudent, address accountSCStudent)
        public
        onlyOwner
    {
        _students[accountStudent] = accountSCStudent;
        _listStudents.push(accountStudent);
        emit studentRegistred(accountStudent);
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
    modifier onlyRegistredUser() {
        require((
            (_universities[msg.sender] != address(0x0)) ||
                (_students[msg.sender] != address(0x0)) ||
                (msg.sender == owner())
        ), "RegistredUser: caller is not a registred user");
        _;
    }

    /*
    * @dev Para obtener una lista con todas las direcciones de empresas en la que iterar
    */
    function getUniversities()
        public
        view
        onlyRegistredUser
        returns (address[] memory)
    {
        return _listUniversities;
    }

    /*
    * @dev Recupera la dirección del smart contract de una universidad asociada
    */
    function getUniversity(address accountUniversity)
        public
        view
        onlyRegistredUser
        returns (address)
    {
        return _universities[accountUniversity];
    }

    /*
    * @dev Para obtener una lista con todas las direcciones de estudiantes registrados
    */
    function getStudents()
        public
        view
        onlyRegistredUser
        returns (address[] memory)
    {
        return _listStudents;
    }

    /*
    * @dev Recupera la dirección del smart contract de un estudiante asociado
    * @param Cuenta del estudiante
    * @return address de la cuenta del SC asociado
    */
    function getStudent(address accountStudent)
        public
        view
        onlyRegistredUser
        returns (address)
    {
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
        require(
            beneficiary != address(0),
            "buyTokens: Beneficiary is account 0."
        );
        require(msg.value != 0, "buyTokens: value is 0.");
        require(
            (_students[beneficiary] != address(0)),
            "buyTokens: beneficiary isn't registred."
        ); //Requerir que el que compra esté registrado como estudiante en la plataforma.

        uint256 amounttokens = msg.value.div(_priceOfOneTokenInWei);
        _weiRaised = _weiRaised.add(msg.value);

        _token.mint(address(this), amounttokens); //Generamos los tokens a medida que los vamos necesitando
        _token.transfer(beneficiary, amounttokens);
        emit BuyTokens(amounttokens, _priceOfOneTokenInWei, beneficiary);
    }

    /**
     * @dev Establece el precio al que se venderá el token ECTSToken.
     * Emite un evento {NewPrice} con `tokenpricewei` indicando el nuevo precio del token
     * @param tokenpricewei Precio del token en wei
     */
    function setTokenPrice(uint256 tokenpricewei) public onlyOwner {
        _priceOfOneTokenInWei = tokenpricewei;
        emit NewPrice(tokenpricewei);
    }

    /**
     * @dev Establece el precio al que se recomprará el token ECTSToken.
     * Emite un evento {NewPriceForRefund} con `tokenpriceweiforrefund` indicando el nuevo precio del token
     * @param tokenpriceweiforrefund Precio del token en wei para el reembolso
     */
    function setTokenPriceForRefund(uint256 tokenpriceweiforrefund)
        public
        onlyOwner
    {
        _priceOfOneTokenInWeiForRefund = tokenpriceweiforrefund;
        emit NewPriceForRefund(tokenpriceweiforrefund);
    }

    /**
     * @dev Recibe la petición de reembolso de ECTS desde una universidad que los ha aprobado previamente
     * Emite un evento ECTS reembolsados {refuntECTS}
     * @param account Cuenta a la que hay que enviar el ether
     * @param amount Cantidad de ECTS que se quieren compensar
     * @return uint256 Cantidad de wei recompensado
     */
    function refundECTS(address account, uint256 amount)
        public
        onlyRegistredUser
        returns (uint256)
    {
        _token.transferFrom(account, address(this), amount);
        uint256 amountWei = _priceOfOneTokenInWeiForRefund.mul(amount);
        address payable accountpayable = address(uint160(account));
        accountpayable.transfer(amountWei);
        emit RefuntECTS(address(this), account, amount);
        return amountWei;
    }

}
