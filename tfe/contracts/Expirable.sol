pragma solidity ^0.6.0;

/**
 * @dev Contrato que añade un modificador que nos permite autorizar el uso de
 * por ejemplo una función durante un tiempo desde que se despliega el smart
 * contract.
 */
contract Expirable {
    uint256 private _expirationtime;

    /**
     * @dev Inicializa el tiempo en el que ya no se podra usar la función.
     */
    constructor (uint256 expirationtime) internal {
        _expirationtime = expirationtime;
    }

    /**
     * @dev Throws si se intenta utilizar más allá de el tiempo que se .
     */
    modifier onTime() {
        require(block.timestamp < _expirationtime, "Expirable: It's late.");
        _;
    }
}