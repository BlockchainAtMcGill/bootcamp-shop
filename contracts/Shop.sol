pragma solidity ^0.4.24;

contract Shop {
    
    address public contractOwner;
    address[] public itemOwners;
    uint[] public itemPrices;
    mapping (address => uint[]) public itemsOwned;
    mapping (address => uint) public balances; //Will represent the balances of a buyer
    
    //Basic modifier indicating that an owner can only use certain things 
    modifier onlyOwner() {
        require(msg.sender == contractOwner);
        _;
    }
    
    constructor() public payable{
        contractOwner = msg.sender;
    }
  
    function listItem(uint price) public onlyOwner {
        itemPrices.push(price * 1 ether) - 1;
        itemOwners.push(msg.sender);
    }
    
    function deleteItem(uint ID) public {
        require(itemOwners[ID] == msg.sender);
        delete itemOwners[ID];
        delete itemPrices[ID];
    }
    
    function buyItem(uint ID) public payable {
        address previousOwner = itemOwners[ID];
        require(previousOwner != address(0));
        require(previousOwner != msg.sender);
        require(itemPrices[ID] == msg.value);
        
        balances[previousOwner] += msg.value; //Increment seller's balance
        itemsOwned[msg.sender].push(ID); //Add new item in my own list
        itemOwners[ID] = msg.sender; //Make the owner be the guy who sent the order
    }
  
    //Withdraw function, whatever is in the balances, 
    function withdrawFunds() public {
        address payee = msg.sender; 
        uint payment = balances[payee];
        
        //Check if payment is positive
        require(payment > 0);
        balances[payee] = 0;
        
        //Move funds
        require(payee.send(payment));
    }

    //Retrieve prices
    function getItemOwners() public view returns (address[] memory) {
        return itemOwners;
    }
    
    //Retrieve owners
    function getItemPrices() public view returns (uint[] memory) {
        return itemPrices;
    }

    //Retrieve balance of a seller
    function balanceOf(address seller) public view returns (uint) {
        return balances[seller];
    }
}