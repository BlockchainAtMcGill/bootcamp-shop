App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  getItems: function() {

    // Load items.
    $.getJSON('../items.json', function(data) {
      
      var shopInstance;

      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;

        return shopInstance.getItemOwners.call();
      }).then(function(itemOwners) {
        for (i = 0; i < itemOwners.length; i++) {
          if (itemOwners[i] == '0x0000000000000000000000000000000000000000') {
            // $('.panel-item').eq(i).find('button').text('Pending...').attr('disabled', true);
            // console.log(`item ${i} should be removed`)
          } else {
            // console.log(`item ${i} owner is ${itemOwners[i]}`)
            data[i].owner = itemOwners[i];
          }
        }
        return shopInstance.getItemPrices.call();
      }).then(function(itemPrices) {
        for (i = 0; i < itemPrices.length; i++) {
          if (itemPrices[i] == 0) {
            // $('.panel-item').eq(i).find('button').text('Pending...').attr('disabled', true);
            // console.log(`item ${i} should be removed`)
          } else {
            // console.log(`item ${i} price is ${itemPrices[i]}`)
            data[i].price = itemPrices[i] / 1000000000000000000;
          }
        }

        var itemsRow = $('#itemsRow');
        var itemTemplate = $('#itemTemplate');

        console.log(data);
        for (i = 0; i < data.length; i ++) {
          data[i].id = i;
          itemTemplate.find('.panel-title').text(data[i].name);
          itemTemplate.find('img').attr('src', data[i].picture);
          itemTemplate.find('.item-type').text(data[i].type);
          itemTemplate.find('.item-price').text(data[i].price);
          itemTemplate.find('.item-owner').text(data[i].owner);
          itemTemplate.find('.btn-buy').attr({'data-id': data[i].id, 'data-price': data[i].price});
          itemTemplate.find('.btn-list').attr({'data-id': data[i].id, 'data-price': data[i].price});
          itemsRow.append(itemTemplate.html());
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });

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

      var account = accounts[0];
      var shopInstance;

      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;

        return shopInstance.balances.call(account, {from: account});
      }).then(function(balance) {
        console.log(balance);
      }).catch(function(err) {
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