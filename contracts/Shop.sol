pragma solidity ^0.4.23;
contract Shop {
    
    address owner;
    Item[] items;
    mapping (address => uint) public itemsOwned;
    mapping (address => uint) public balances; //Will represent the balances of a buyer
    uint leftOver;
  
    //What an object item possesses
    struct Item{
        string name; 
        uint ID;
        uint price; 
        uint quantity;
        address seller;
        address owner;
        //Add in other stuff like categories if needed later
    }
    
    //Basic modifier indicating that an owner can only use certain things 
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    constructor() public {
        owner = msg.sender;
    }
  
    function listItem(string name, uint price, uint quantity) public {
        
        uint unitPrice = 1 ether;
        // items[ID] = Item(name, ID, price, quantity, msg.sender, 0);
        uint ID = items.push(Item(name, 0, price, quantity, msg.sender, 0)) - 1;
        items[ID].ID = ID;
    }
    
    function deleteItem(uint ID) public onlyOwner{
        Item memory item = items[ID];
        
        require(item.ID >=0);
        
        if (items.length > 1) {
            items[ID] = items[items.length-1];
        }
        
        items.length--;
    }
    
    function buy(uint ID) public payable {
        
        //Make sure the amount sent to buy item is correct
        Item memory item = items[ID];
        require(msg.value >= item.price);
        itemsOwned[msg.sender] = ID;
        items[ID].owner = msg.sender;
        balances[item.seller] += msg.value;
        leftOver += msg.value - item.price;
    }
  
    //Withdraw function
    function withdrawFunds() public {
        
        address payee = msg.sender;
        uint payment = balances[payee];
        //Check if payment is positive
        require(payment > 0);
        balances[payee] = 0;
        //Move funds
        require(payee.send(payment));
    }
  
    function withdrawLeftover() public onlyOwner {
        require(msg.sender.send(leftOver));
    }
  
    //Retrieve balance of a seller
    function balanceOf(address seller) public view returns (uint) {
        return balances[seller];
    }
    
    //function that retrieves an items info 
    function getItemInfo(uint ID) public view returns (uint, string, uint, uint) {
        Item memory item = items[ID];
        return (item.ID, item.name, item.price, item.quantity);
    }
}