App = {
  web3Provider: null,
  contracts: {},
  instance: null,

  init: function() {
    return App.initWeb3();
  },

  initFunctions: function() {

    shopInstance = App.instance;

    var itemCount;
    var itemPromises = [];
    var items = [];

    var listItemEvent = shopInstance.listItemEvent();
    var deleteItemEvent = shopInstance.deleteItemEvent();
    var buyEvent = shopInstance.buyEvent();
    var withdrawFundsEvent = shopInstance.withdrawFundsEvent();
    
    listItemEvent.watch(function(error, result){});
    deleteItemEvent.watch(function(error, result){});
    buyEvent.watch(function(error, result){});
    withdrawFundsEvent.watch(function(error, result){});  

    App.getBalance();

    shopInstance.itemCount.call().then(function(data) {
      itemCount = data.toString();
      console.log(`Number of items: ${itemCount}`);
      for (var i = 0; i < itemCount; i++) {
        itemPromises.push(shopInstance.items.call(i))
      }
      Promise.all(itemPromises).then(contractData => {
        // Load item images
        $.getJSON('../images.json').then(localData => {
          contractData.map(data => {
            var item = {};
            item.name = data[0];
            item.id = parseInt(data[1].toString());
            item.price = parseInt(data[2].toString());
            item.owner = data[3];
            localData.hasOwnProperty(item.id) ?
            item.image = localData[item.id].image :
            item.image = "images/default.png";
            items.push(item);
          });
          console.log(items);
          App.renderItems(items);
        });
      });
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  renderItems: function(items) {
    var itemsRow = $('#itemsRow');
    var itemTemplate = $('#itemTemplate');

    for (i = 0; i < items.length; i ++) {
      items[i].id = i;
      itemTemplate.find('.panel-title').text(items[i].name);
      itemTemplate.find('.item-title').text(items[i].name);
      itemTemplate.find('img').attr('src', items[i].image);
      itemTemplate.find('.item-id').text(items[i].id);
      itemTemplate.find('.item-price').text(parseInt(items[i].price) / 1000000000000000000);
      itemTemplate.find('.item-owner').text(items[i].owner);
      itemTemplate.find('.btn-buy').attr({'data-id': items[i].id, 'data-price': items[i].price});
      itemTemplate.find('.btn-list').attr({'data-id': items[i].id, 'data-price': items[i].price});
      itemsRow.append(itemTemplate.html());
    }
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    var networkName;

    web3.version.getNetwork((err, netId) => {
      switch (netId) {
        case "1":
          networkName = "Mainnet"
          break
        case "42":
          networkName = "Rinkeby"
          break
        case "4":
          networkName = "Kovan"
          break
        default:
          networkName = "Unknown"
      }
      $('#network-name').text(networkName);
    })

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Shop.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var ShopArtifact = data;
      App.contracts.Shop = TruffleContract(ShopArtifact);

      // Set the provider for our contract.
      App.contracts.Shop.setProvider(App.web3Provider);

      // Get the deployed contract on local blockchain
      App.contracts.Shop.deployed().then(function(shopInstance) {
        App.instance = shopInstance;
        App.initFunctions();
        return App.bindEvents();
      })
      // Use our contract to retieve and mark the bought items.
    });
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handleBuy);
    $(document).on('submit', '.form-post', App.handleList);
    $(document).on('click', '.btn-delete', App.handleDelete);
    $(document).on('click', '.btn-withdraw', App.handleWithdraw);
  },

  handleList: event => {
    var name = event.target.name.value;
    var price = event.target.price.value;
    // var image = `images/${event.target.image.value.replace(/.*[\/\\]/, '')}`;
    // console.log(image);
    console.log(`listing item ${name} for ${price} ETH`);

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      shopInstance = App.instance;
      shopInstance.listItem(name, price * 1000000000000000000, {from: account, gas: 999999}).then(function(result) {
        console.log(result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleWithdraw: function() {

    console.log('withdrawing')
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      shopInstance = App.instance;
      shopInstance.withdrawFunds({from: account, gas: 999999}).then(function(result) {
        // console.log(`account balance: ${web3.fromWei(web3.eth.getBalance(account))}`);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleDelete: function(id) {
    event.preventDefault();

    var itemId = parseInt($(event.target).data('id'));

    console.log(`deleting item: ${itemId}`);

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      shopInstance = instance;
      shopInstance.deleteItem(itemId, {from: account, gas: 999999}).then(function(result) {
        return App.initFunctions();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleBuy: function() {
    event.preventDefault();

    var itemId = parseInt($(event.target).data('id'));
    var itemPrice = parseInt($(event.target).data('price'));

    console.log(`buying item: ${itemId} for ${itemPrice} ETH`);

    $(event.target).data('id')
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      shopInstance = App.instance;
      shopInstance.buyItem(itemId, {from: account, value: itemPrice, gas: 999999}).then(function(result) {
        // return App.initFunctions();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getBalance: function() {

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      if (accounts == undefined || accounts.length == 0) {
        $('.metamask-locked').text("Unlock Metamask to continue");
        return;
      }
      
      var account = accounts[0];
      $('#wallet-address').text(account);
      var shopInstance;

      shopInstance = App.instance;
      shopInstance.balances.call(account, {from: account}).then(balance => {
      $('#balance-amount').text(`${parseInt(balance.toString()) / 1000000000000000000} ETH`);
      }).catch(err => {
        console.log(err.message);
      });
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
