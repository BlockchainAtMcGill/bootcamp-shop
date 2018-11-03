pragma solidity ^0.4.23;

contract Shop {
  address[16] public buyers;

  function buy(uint itemID) public returns (uint) {
    require(itemID >= 0 && itemID <= 15, "");

    buyers[itemID] = msg.sender;

    return itemID;
  }

  function getBuyers() public view returns (address[16]) {
    return buyers;
  }
}