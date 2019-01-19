App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  getItems: function() {
      
      var shopInstance;
      var itemCount;
      var itemPromises = [];
      var items = [];

      App.getBalance();

      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;
        return shopInstance.itemCount.call();
      }).then(function(data) {
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
      itemTemplate.find('img').attr('src', items[i].image);
      itemTemplate.find('.item-price').text(items[i].price);
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

      // Use our contract to retieve and mark the bought items.
      return App.getItems();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handleBuy);
    $(document).on('click', '.btn-list', App.handleList);
    $(document).on('click', '.btn-delete', App.handleDelete);
    $(document).on('click', '.btn-withdraw', App.handleWithdraw);
  },

  handleList: function() {

    event.preventDefault();

    var itemPrice = parseInt($(event.target).data('price'));

    console.log(`listing item for ${itemPrice} ETH`);

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;

        return shopInstance.listItem(itemPrice * 1000000000000000000, {from: account, gas: 999999});
      }).then(function(result) {
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

      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;

        return shopInstance.withdrawFunds({from: account, gas: 999999});
      }).then(function(result) {
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

      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;

        return shopInstance.deleteItem(itemId, {from: account, gas: 999999});
      }).then(function(result) {
        return App.getItems();
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

      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;

        return shopInstance.buyItem(itemId, {from: account, value: itemPrice * 1000000000000000000, gas: 999999});
      }).then(function(result) {
        return App.getItems();
        
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

      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;
        console.log(accounts)
        return shopInstance.balances.call(account, {from: account});
      }).then(balance => {
        $('#balance-amount').text(balance.toString());
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