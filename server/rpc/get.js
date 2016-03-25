'use strict';

var async = require('async');
var config = require('../config.js');

var price_settings = function(callback) {
  config.load(function(err, config) {
    if (err) return callback(err);
    var coin = config.exchanges.plugins.current.coin || "BTC"
    coin = (coin == 'BTC' ? '' : coin);
    callback(null, {
      provider: config.exchanges.plugins.current[coin + "ticker"],
      commission: config.exchanges.settings[coin + "commission"],
      custom_url: null
    });
  });
};

var wallet_settings = function(callback) {
  config.load(function(err, config) {
    if (err) return callback(err);
    var coin = config.exchanges.plugins.current.coin || "BTC"
    coin = (coin == 'BTC' ? '' : coin);
    var provider = config.exchanges.plugins.current[coin + "transfer"];
    var settings = config.exchanges.plugins.settings[provider];
    settings.provider = provider;
    callback(null, settings);
  });
};

var exchange_settings = function(callback) {
  config.load(function(err, config) {
    if (err) return callback(err);
    var coin = config.exchanges.plugins.current.coin || "BTC"
    coin = (coin == 'BTC' ? '' : coin);
    var provider = config.exchanges.plugins.current[coin + "trade"];
    if (!provider) {
      return callback(null, null);
    }

    var settings = config.exchanges.plugins.settings[provider] || {};
    settings.provider = provider;
    callback(null, settings);
  });
};

var compliance_settings = function(callback) {
  config.load(function(err, config) {
    if (err) return callback(err);

    var default_settings =  {
      base: {
        limit: 100,
        verify_type: 'drivers_license'
      },
      extended: {
        limit: 400,
        verify_type: 'smartphone'
      },
      maximum: {
        limit: 500
      }
    };
    var coin = config.exchanges.plugins.current.coin || "BTC"
    coin = (coin == 'BTC' ? '' : coin);
    var compliance = config.exchanges.settings[coin + "compliance"] || default_settings;

    callback(null, compliance);
  });
};


var coin_settings = function(callback) {
  config.load(function(err, config) {
    if (err) return callback(err);
    var coin = config.exchanges.plugins.current.coin || "BTC"
    var enabled = config.exchanges.plugins.coins[coin]
    var settings = {
      coin: coin,
      enabled: enabled
    };
    callback(null, settings);
  });
};


exports.actions = function(req, res, ss) {

  req.use('session')
  req.use('user.authenticated')

  return {

    price: function() {

      //return price settings to the client
      price_settings(res);

    }, 
    
    wallet: function(){

      //return wallet settings to the client
      wallet_settings(res);

    }, 
    
    exchange: function() {
      //return exchange settings to the client
      exchange_settings(res);

    },

    currency: function() {

      //defaults to usd for now
      res({type:'USD', symbol:'$'})

    },

    compliance: function() {

      //return compliance settings
      compliance_settings(res);

    },

    coins: function() {
      //return coin settings
      coin_settings(res);

    },

    user: function() { //grabs all price/wallet/exhange data

      async.parallel({
        price: async.apply(price_settings),
        wallet: async.apply(wallet_settings),
        exchange: async.apply(exchange_settings),
        compliance: async.apply(compliance_settings),
        coins: async.apply(coin_settings)
      }, function(err, results) {

        if (err) //if err don't try to return data
          return res(err)

        var user = {
          price: results.price,
          wallet: results.wallet,
          exchange: results.exchange,
          compliance: results.compliance,
          coins: results.coins
        };

        //return data to the client
        res(null, user);
      });
    }
  }
}
