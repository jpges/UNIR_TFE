pragma solidity 0.6.0;

import "./ECTSToken.sol";
import "./Universities.sol";
import "./Students.sol";
import "./openzeppelin/ownership/Ownable.sol";

/**
 * @dev El smart contract UniversityPlatform representa la administración general de todo el sistema.
 * Se encarga de desplegar cosas necesarias como el token que representa a los ECTS y los Smartcontracts
 * que dan acceso y funcionalidad a universidades y alumnos.
 *
 * Sólo hereda del smartcontract Ownable porque en algunos casos exigiremos que algunos métodos únicamente
 * pueda lanzarlos el que desplegó la plataforma.
 */
contract UniversityPlatform is Ownable {
    using SafeMath for uint256;
    
    //Events
    event BuyTokens(uint256 amount, uint256 priceOfOneTokenInWei, address msgsender);
    event NewPrice(uint256 tokenpricewei);
    
    // Smartcontracts relacionados
    ECTSToken private _token;
    Universities private _universities;
    Students private _students;
    
    //Precio de un token en wei
    uint256 public priceOfOneTokenInWei;
  
    //Total tokens vendidos en wei
    uint256 public weiRaised;

    /**
     * @dev Inicializa el contrato desplegando el token ECTSToken y los componentes universidades y estudiantes.
     * También establece el precio inicial que queremos poner a los ECTS, pero posteriormente se puede cambiar manualmente.
     */
    constructor() public {
        _token = new ECTSToken();
        _universities = new Universities(address(this), address(_token));
        _students = new Students(address(this), address(_token));
    
        setTokenPrice((76/100) * 10**18); //Inicialmente establezco el valor en 0,76 ETHER que son unos 150€
    }
    
    /**
     * @dev Cuando se llama al contract sin método y con ether se ejecutará este método.
     */
    receive() external payable {
        buyTokens(msg.sender);
    }
    
    /**
     * @dev Indica si la cuenta recibida por parámetro es de algún estudiante, universidad o el propio gestor de la plataforma
     * @param account es la cuenta que se quiere comprobar
     * @return bool Indica si es o no una cuenta registrada
     */
    function isRegistredUser(address account) public view returns (bool){
        return (_universities.isRegistredUniversity(account) || (account == owner())) ;
    }
  
    /**
     * @dev Es la función que sirve para comprar tokens por parte del estudiante.
     * Requiere que el que compra sea un estudiante registrado en la plataforma.
     * Emite un evento {BuyTokens} con `tokens` comprados al precio {priceOfOneTokenInWei} por {beneficiary}.
     * Los tokens se mintan en el momento en el que son adquiridos.
     * @param beneficiary Es la cuenta que adquiere los tokens
     */
    function buyTokens(address beneficiary) public payable {
        require(beneficiary != address(0));
        require(msg.value != 0);
        //TODO: Requerir que el que compra esté registrado como estudiante en la plataforma.

        uint256 amounttokens = msg.value.div(priceOfOneTokenInWei);
        weiRaised = weiRaised.add(msg.value);
    
        _token.mint(owner(), amounttokens); //Generamos los tokens a medida que los vamos necesitando
        _token.transfer(beneficiary, amounttokens);
        emit BuyTokens(amounttokens, priceOfOneTokenInWei, beneficiary);
    }
  
    /**
     * @dev Establece el precio al que se venderá el token ECTSToken.
     * Emite un evento {NewPrice} con `tokenpricewei` indicando el nuevo precio del token
     * @param tokenpricewei Precio del token en wei
     */
    function setTokenPrice(uint256 tokenpricewei) public onlyOwner{
        priceOfOneTokenInWei = tokenpricewei;
        emit NewPrice(tokenpricewei);
    }

}