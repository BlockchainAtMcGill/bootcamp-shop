pragma solidity ^0.4.24;

contract Shop {
    
    address public contractOwner;
    Item[] public items;
    mapping (address => uint[]) public itemsOwned;
    mapping (address => uint) public balances; //Will represent the balances of a buyer

    //What an object item possesses
    struct Item {
        string name; 
        uint ID;
        uint price;
        address owner;
        bool active;
    }
    
    //Basic modifier indicating that an owner can only use certain things 
    modifier onlyOwner() {
        require(msg.sender == contractOwner);
        _;
    }
    
    constructor() public payable{
        contractOwner = msg.sender;
    }
  
    function listItem(string name, uint price) public onlyOwner {
        uint ID = items.push(Item(name, 0, price * 1 ether, msg.sender, true)) - 1;
        items[ID].ID = ID;
    }
    
    function deleteItem(uint ID) public {

        require(msg.sender == items[ID].owner);
        delete items[ID];
    }
    
    function buyItem(uint ID) public payable {
        
        Item memory item = items[ID];
        
        require(item.active); //Must be active item
        require(item.owner != msg.sender); //Prevent buying own item
        require(msg.value == item.price); //Must send exact amount
        
        balances[item.owner] += msg.value; //Increment seller's balance
        itemsOwned[msg.sender].push(ID); //Add new item in my own list
        items[ID].owner = msg.sender; //Make the owner be the guy who sent the order
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
}