pragma solidity ^0.5.0;

import "browser/ArtToken.sol";
import "browser/AuctionToken.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721Receiver.sol";

contract Auction is IERC721Receiver {
    
    address public artTokenCollectionAddress;
    mapping(uint256 => address) public auctionOwner;
    mapping(uint256 => bool) public auctionActive;
    mapping(uint256 => AuctionToken) public auctionTokens;
    mapping(uint256 => HighestBid) public highestBids;
    
    struct HighestBid {
        uint256 amount;
        address bidder;
    }
    
    constructor(string memory name, string memory symbol) public{
        artTokenCollectionAddress = address(new ArtToken(name,symbol));
    }
    
    function createAuction(uint256 _auctionTokensToCreate, string memory descriptionURI) public returns(uint256,address){
        ArtToken artTokenCollection = ArtToken(artTokenCollectionAddress);
        AuctionToken auctionToken = new AuctionToken(msg.sender, _auctionTokensToCreate);
        uint256 tokenId = artTokenCollection.mint(address(this));
        artTokenCollection.setTokenURI(tokenId, descriptionURI);
        auctionOwner[tokenId] = msg.sender;
        auctionTokens[tokenId] = auctionToken;
        return (tokenId,address(auctionToken));
    }
    
    function endAuction(uint256 _tokenId) public {
        require(auctionTokens[_tokenId].balanceOf(address(this)) == auctionTokens[_tokenId].totalSupply() || auctionOwner[_tokenId] == msg.sender,"AUCTION: auction cannot be ended");
        require(auctionActive[_tokenId],"AUCTION: bid is not active");
        auctionActive[_tokenId] = false;
        ArtToken artTokenCollection = ArtToken(artTokenCollectionAddress);
        artTokenCollection.approve(highestBids[_tokenId].bidder,_tokenId);
    }
    
    function stopAuction(uint256 _tokenId) public {
        require(auctionActive[_tokenId],"AUCTION: bid is not active");
        require(auctionOwner[_tokenId] == msg.sender,"AUCTION: only owner of auction can stop it");
        auctionActive[_tokenId] = false;
    }
    
    function startAuction(uint256 _tokenId) public {
        require(auctionActive[_tokenId],"AUCTION: bid is active");
        require(auctionOwner[_tokenId] == msg.sender,"AUCTION: only owner of auction can stop it");
        auctionActive[_tokenId] = true;
    }
    
    function bid(uint256 _tokenId, uint256 _bid) public {
        require(auctionActive[_tokenId],"AUCTION: bid is not active");
        require(highestBids[_tokenId].amount<_bid,"AUCTION: bid must higher than last one");
        highestBids[_tokenId].amount = _bid;
        highestBids[_tokenId].bidder = msg.sender;
        AuctionToken auctionToken = auctionTokens[_tokenId];
        auctionToken.transferFrom(msg.sender, address(this), _bid);
    }
    
    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data)
    public returns (bytes4) {
        return 0x150b7a02;
    }
}