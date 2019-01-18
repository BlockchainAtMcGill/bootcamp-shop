App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load items.
    $.getJSON('../items.json', function(data) {
      var itemsRow = $('#itemsRow');
      var itemTemplate = $('#itemTemplate');

      for (i = 0; i < data.length; i ++) {
        itemTemplate.find('.panel-title').text(data[i].name);
        itemTemplate.find('img').attr('src', data[i].picture);
        itemTemplate.find('.item-type').text(data[i].type);
        itemTemplate.find('.item-price').text(data[i].price);
        itemTemplate.find('.item-seller').text(data[i].seller);
        itemTemplate.find('.btn-buy').attr('data-id', data[i].id);

        itemsRow.append(itemTemplate.html());
      }
    });

    return App.initWeb3();
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
  },

  handleList: function() {
    
  },

  handleWithdraw: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;

        return shopInstance.withdrawFunds({from: account});
      }).then(function(result) {
        console.log(`account balance: ${web3.fromWei(web3.eth.getBalance(account))}`);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleDelete: function(id) {
    // event.preventDefault();

    // var itemId = parseInt($(event.target).data('id'));

    // console.log(`deleting item: ${$(event.target).data('id')}`);
    // $(event.target).data('id')
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;

        return shopInstance.deleteItem(id, {from: account, gas: 999999});
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

    console.log(`buying item: ${$(event.target).data('id')}`);
    $(event.target).data('id')
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;

        return shopInstance.buyItem(itemId, {from: account, value: 1000000000000000000, gas: 999999});
      }).then(function(result) {
        // return App.getItems();
        
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getItems: function(items, account) {
    var shopInstance;

    App.contracts.Shop.deployed().then(function(instance) {
      shopInstance = instance;

      return shopInstance.getItemOwners.call({from: account});
    }).then(function(itemOwners) {
      console.log(itemOwners);
      // for (i = 0; i < itemOwners.length; i++) {
      //   if (itemOwners[i] !== '0x0000000000000000000000000000000000000000') {
      //     // $('.panel-item').eq(i).find('button').text('Pending...').attr('disabled', true);
      //     console.log(`item ${i} should be removed`)
      //   } else {
      //     console.log(`item ${i} owner is ${itemOwners[i]}`)
      //   }
      // }
      return shopInstance.getItemPrices.call({from: account});
    }).then(function(itemPrices) {
      console.log(itemPrices[1]);
    }).catch(function(err) {
      console.log(err.message);
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