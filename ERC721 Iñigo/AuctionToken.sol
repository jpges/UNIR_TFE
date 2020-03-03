pragma solidity ^0.5.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

contract AuctionToken is ERC20 {
    
    constructor (address _auctionOwner, uint256 _amount) public {
        _mint(_auctionOwner, _amount);
    }
    
}