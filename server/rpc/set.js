'use strict';

var config = require('../config.js');

exports.actions = function (req, res, ss) {

  req.use('session');
  req.use('user.authenticated');

  return {

    price: function (data) {
      config.load(function (err, results) {
        if (err) return res(err);
        var coin = results.exchanges.plugins.current.coin || "BTC"
        coin = (coin == 'BTC' ? '' : coin);
        results.exchanges.settings[coin + "commission"] = data.commission;
        results.exchanges.plugins.current[coin + "ticker"] = data.provider;
        config.saveExchangesConfig(results, res);
      });
    },
    
    wallet: function(data) {
      config.load(function(err, results) {
        if (err) return res(err);
        var coin = results.exchanges.plugins.current.coin || "BTC"
        coin = (coin == 'BTC' ? '' : coin);
        var provider = data.provider;
        var settings = results.exchanges.plugins.settings[provider];
        results.exchanges.plugins.current[coin + "wallet"] = provider;
        Object.keys(data).forEach(function(key) {
          if (key !== 'provider')
            settings[key] = data[key];
        });

        config.saveExchangesConfig(results, res);
      });
    },

    exchange: function(data) {
      config.load(function(err, results) {
        if (err) return res(err);

        var coin = results.exchanges.plugins.current.coin || "BTC"
        coin = (coin == 'BTC' ? '' : coin);
        var provider = data != null && data.hasOwnProperty("enabled") && data.enabled ? data.provider : null;
        results.exchanges.plugins.current[coin + "trade"] = provider;

        if (provider) {
          var settings = results.exchanges.plugins.settings[provider] ||
                         (results.exchanges.plugins.settings[provider] = {});
          Object.keys(data).forEach(function(key) {
            if (key !== 'provider' && key !== 'enabled')
              settings[key] = data[key];
          });          
        }

        config.saveExchangesConfig(results, res);
      });
    },

    currency: function(data) {

      //data example: {type:'USD'}

      //set the data in the database

      //return the object (with symbol) like we would get from get.currency, example: {type:'USD', symbol:'$'}

    },

    coins: function(data) {
      config.load(function(err, results) {
        if (err) return callback(err);
        results.exchanges.plugins.current['coin'] = data['coin']
        if (data.hasOwnProperty('enabled')) {
          results.exchanges.plugins.coins[data['coin']] = data['enabled'];
        } else {
          results.exchanges.plugins.coins[data['coin']] = true;
        }
        config.saveExchangesConfig(results, res);
      });
    },

    compliance: function(data) {
      config.load(function(err, results) {
        if (err) return callback(err);
        // validate elements???
        var coin = results.exchanges.plugins.current.coin || "BTC"
        coin = (coin == 'BTC' ? '' : coin);
        results.exchanges.settings[coin + "compliance"] = data;
        // res { ok: true }
        config.saveExchangesConfig(results, res);
      });
    }
  };
};
