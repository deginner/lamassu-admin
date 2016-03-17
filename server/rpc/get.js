'use strict';

var async = require('async');
var config = require('../config.js');

var price_settings = function(coin, callback) {
  config.load(function(err, config) {
    if (err) return callback(err);
    callback(null, {
      provider: config.exchanges.plugins.current[coin + "ticker"],
      commission: config.exchanges.settings[coin + "commission"],
      custom_url: null
    });
  });
};

var wallet_settings = function(coin, callback) {
  config.load(function(err, config) {
    if (err) return callback(err);

    var provider = config.exchanges.plugins.current[coin + "transfer"];
    var settings = config.exchanges.plugins.settings[provider];
    settings.provider = provider;
    callback(null, settings);
  });
};

var exchange_settings = function(coin, callback) {
  config.load(function(err, config) {
    if (err) return callback(err);

    var provider = config.exchanges.plugins.current[coin + "trade"];
    if (!provider) {
      return callback(null, null);
    }

    var settings = config.exchanges.plugins.settings[provider] || {};
    settings.provider = provider;
    callback(null, settings);
  });
};

var compliance_settings = function(coin, callback) {
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

    var compliance = config.exchanges.settings[coin + "compliance"] || default_settings;

    callback(null, compliance);
  });
};



exports.actions = function(req, res, ss) {

  req.use('session')
  req.use('user.authenticated')

  return {

    price: function(coin) {

      //return price settings to the client
      price_settings(coin, res);

    }, 
    
    wallet: function(coin){

      //return wallet settings to the client
      wallet_settings(coin, res);

    }, 
    
    exchange: function(coin) {

      //return exchange settings to the client
      exchange_settings(coin, res);

    },

    currency: function() {

      //defaults to usd for now
      res({type:'USD', symbol:'$'})

    },

    compliance: function(coin) {

      //return compliance settings
      compliance_settings(coin, res);

    },

    user: function(coin) { //grabs all price/wallet/exhange data
      var coin = coin || 'BTC';

      async.parallel({
        price: async.apply(price_settings, coin),
        wallet: async.apply(wallet_settings, coin),
        exchange: async.apply(exchange_settings, coin),
        compliance: async.apply(compliance_settings, coin)
      }, function(err, results) {

        if (err) //if err don't try to return data
          return res(err)

        var user = {
          price: results.price,
          wallet: results.wallet,
          exchange: results.exchange,
          compliance: results.compliance
        };

        //return data to the client
        res(null, user);
      });
    }
  }
}
