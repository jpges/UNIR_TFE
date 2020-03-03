pragma solidity ^0.6.0;

/**
 * @dev Contrato que añade a los tokens ERC721 un mecanismo para controlar
 * el número de tokens mintado y limitar el mintado por encima de un numero
 * controlado inicialmente.
 *
 * Principalmente lo he desarrollado para crear el modificador "belowLimit" y
 * utilizarlo antes de mintar.
 */
contract Limitable {
    uint256 private _minted;
    uint256 private _limit;

    /**
     * @dev Inicializa el contra estableciendo la variable limit.
     */
    constructor (uint256 limit) internal {
        _minted = 0;
        _limit = limit;
    }

    /**
     * @dev Devuelve el número de tokens máximo que pueden ser mintados
     */
    function limit() public view returns (uint256) {
        return _limit;
    }

    /**
     * @dev Devuelve el número de tokens mintados
     */
    function minted() public view returns (uint256) {
        return _minted;
    }

    /**
     * @dev Incrementa en 1 el numero de tokens mintados
     */
    function increase() internal belowLimit{
        _minted = _minted + 1;
    }

    /**
     * @dev Throws si se intenta superar el número de tokens límite.
     */
    modifier belowLimit() {
        require(_minted < _limit, "Limitable: Limit exceeded");
        _;
    }
}