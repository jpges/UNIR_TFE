pragma solidity ^0.5.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/ownership/Ownable.sol";

contract ECTSToken is ERC20Detailed, ERC20, Ownable {
    constructor() public ERC20Detailed("ECTSToken", "ECTS", 0) {}

    /** @dev Crea `amount` tokens y los asigna a la cuenta `beneficiary`, incrementando
     * el total suply.
     *
     * Emite un evento {Transfer} con `from` asociado a la cuenta 0.
     *
     * Requisitos
     *
     * - `account` no puede ser la cuenta 0.
     * - Solo puede llamar a este método el propietario del SM.
     */
    function mint(address beneficiary, uint256 amount) public onlyOwner {
        _mint(beneficiary, amount);
    }
}
