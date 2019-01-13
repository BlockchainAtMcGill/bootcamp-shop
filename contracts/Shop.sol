pragma solidity ^0.4.24;
contract Shop {
    
    address owner;
    Item[] items;
    mapping (address => uint) public itemsOwned;
    mapping (address => uint) public balances; //Will represent the balances of a buyer

    //What an object item possesses
    struct Item{
        string name; 
        uint ID;
        uint price; 
        uint quantity;
        address seller;
        address owner; 
    }
    
    //Basic modifier indicating that an owner can only use certain things 
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    constructor() public payable{
        owner = msg.sender;
    }
  
    function listItem(string name, uint price, uint quantity) public onlyOwner {
        
        uint ID = items.push(Item(name, 0, price, quantity, msg.sender, 0)) - 1;
        items[ID].ID = ID;
        
    }
    
    function deleteItem(uint ID) public onlyOwner{
        Item memory item = items[ID];
        
        require(item.ID >=0);
        
        if (items.length > 1) {
            items[ID] = items[items.length-1]; //Setting the last item to the index where the item was deleted
        }
        
        items.length--;
    }
    
    function buy(uint ID) public payable {
        
        //Make sure the amount sent to buy item is correct
        Item memory item = items[ID];
        
        require(msg.value >= item.price);
        require(items[ID].quantity > 0);
        
        itemsOwned[msg.sender] = ID; //Add new item in my own list
        items[ID].owner = msg.sender; //Make the item be the guy who sent the order
        balances[item.seller] += msg.value; //Increment seller's balance
        balances[item.owner] -= msg.value;  //Decrement buyer's balance
        items[ID].quantity -= 1;
      	
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