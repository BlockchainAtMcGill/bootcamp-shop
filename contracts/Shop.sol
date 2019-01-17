pragma solidity ^0.4.24;

<<<<<<< HEAD
//Finalized version of with events 
contract Shop {
    
    address public contractOwner;
    Item[] public items;
    mapping (address => uint[]) public itemsOwned;
    mapping (address => uint) public balances; //Will represent the balances of a buyer
    
    uint transaction_id; //Added a transaction id for events

    //What an object item possesses
    struct Item {
        string name; 
        uint ID;
        uint price;
        address owner;
        bool active; //Ask dennis
    }
=======
contract Shop {
    
    address public contractOwner;
    address[] public itemOwners;
    uint[] public itemPrices;
    mapping (address => uint[]) public itemsOwned;
    mapping (address => uint) public balances; //Will represent the balances of a buyer
>>>>>>> bf6dbf08117adce4d502959b6b2616cce895d65c
    
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
  
<<<<<<< HEAD
    function listItem(string name, uint price) public onlyOwner {
        uint ID = items.push(Item(name, 0, price * 1 ether, msg.sender, true)) - 1;
        items[ID].ID = ID;
        
        emit listItemEvent(ID, name, price); 
    }
    
    //Get rid of item bought
    function deleteItem(uint ID) public {

        require(msg.sender == items[ID].owner);
        delete items[ID];
        
        emit deleteItemEvent(ID);
    }
    
    function buyItem(uint ID) public payable {
        
        Item memory item = items[ID];
        
        require(item.active); //Must be active item
        require(item.owner != msg.sender); //Prevent buying own item
        require(msg.value == item.price); //Must send exact amount
        
        balances[item.owner] += msg.value; //Increment seller's balance
        itemsOwned[msg.sender].push(ID); //Add new item in my own list
        items[ID].owner = msg.sender; //Make the owner be the guy who sent the order
        
        emit buyEvent(ID, items[ID].name, items[ID].price, items[ID].owner);
=======
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
>>>>>>> bf6dbf08117adce4d502959b6b2616cce895d65c
    }
  
    //Withdraw function, whatever is in the balances 
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
<<<<<<< HEAD
=======

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
>>>>>>> bf6dbf08117adce4d502959b6b2616cce895d65c
}