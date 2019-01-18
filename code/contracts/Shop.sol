pragma solidity ^0.4.24;

contract Shop {
    
    address public contractOwner;
    uint public itemCount;
    mapping (uint => Item) public items;
    mapping (address => uint[]) itemsOwned;
    mapping (address => uint) public balances; //Will represent the balance of a seller
    
    //What an object item possesses
    struct Item {
        string name; 
        uint ID;
        uint price;
        address owner;
        bool active; // Signal to frontend that item is active in mapping
    }
    
    //Event declarations

    event listItemEvent(
        uint ID, 
        string name,
        uint price
    );
    
    event deleteItemEvent(
        uint ID 
    );
    
    event buyEvent(
        uint ID, 
        string name,
        uint price,
        address owner
    );
    
    event withdrawFundsEvent(
        address payee, 
        uint fundsWithdrawn
    );
    
    //Basic modifier indicating that an owner can only use certain things 
    modifier onlyOwner() {
        require(msg.sender == contractOwner);
        _;
    }
    
    constructor() public payable{
        contractOwner = msg.sender;
    }
  
    function listItem(string name, uint price) public onlyOwner {
        uint ID = itemCount;
        itemCount ++;
        items[ID] = Item(name, ID, price, msg.sender, true);
        itemsOwned[msg.sender].push(ID); //Add new item in my own list
        emit listItemEvent(ID, name, price); 
    }
    
    function deleteItem(uint ID) public {

        require(items[ID].owner != address(0));
        require(msg.sender == items[ID].owner);
        delete items[ID];
        emit deleteItemEvent(ID);
    }
    
    function buyItem(uint ID) public payable {
        
        Item memory item = items[ID];
        
        require(items[ID].owner != address(0)); //Must be active item
        require(item.owner != msg.sender); //Prevent buying own item
        require(msg.value == item.price); //Must send exact amount
        
        balances[item.owner] += msg.value; //Increment seller's balance
        itemsOwned[msg.sender].push(ID); //Add new item in my own list
        items[ID].owner = msg.sender; //Make the owner be the guy who sent the order
        
        emit buyEvent(ID, items[ID].name, items[ID].price, items[ID].owner);
    }
  
    function withdrawFunds() public {
        
        address payee = msg.sender; 
        uint payment = balances[payee];
        
        //Check if payment is positive
        require(payment > 0);
        balances[payee] = 0;
        
        //Move funds
        require(payee.send(payment));
        
        emit withdrawFundsEvent(msg.sender, payment);
    }
    
    function getItemsOwned() public view returns (uint[]) {
        return itemsOwned[msg.sender];
    }
}