'use strict';

module.exports = Backbone.View.extend({

  className: 'main_coins main_wrap',

  initialize: function(){

    var self = this;

    self.$el.html(ss.tmpl['main-coins'].render()).appendTo('.dash .main').addClass('animated fadeInUp');

    self.fill_view();
  
    self.$el.find('select').on('change', self.update_settings.bind(self));

    self.$el.find('.toggle').on('click', function(){

      self.set_toggle.apply(self)

      self.update_settings.apply(self)

    })


  },
  update_settings: function(ev){

    var self = this;
    
    //define settings object
    var val_coin = self.$el.find('#coin').val()
    self.user.set('coins',  {'coin': val_coin, 'enabled': self.enabled});
    self.user.once('saved:coins', function (err) {
      ss.rpc('get.user', function(err, user) {
        if (err)
          console.log('Error returned from user.get: \n\n' + JSON.stringify(err, null, '  '));
        if (user != null) {
          self.user.set('exchange', user.exchange);
          self.user.set('wallet', user.wallet);
          self.user.set('price', user.price);
          self.user.set('compliance', user.compliance);
          //self.set(user, {silent: true})
        }
      });
    });
  },

  set_toggle: function(){

    var self = this
    if(self.enabled){

      self.enabled = false
      self.$el.find('.toggle .inactive').css({'display':'block'})
      self.$el.find('.toggle .active').css({'display':'none'})

    }else{

      self.enabled = true
      self.$el.find('.toggle .inactive').css({'display':'none'})
      self.$el.find('.toggle .active').css({'display':'block'})

    }

  },

  fill_view: function(){ //fill fields with current settings

    var self = this;

    var coin_settings = {
      coin: 'BTC',
      enabled: true
    };
    var coins = self.user.get('coins') || coin_settings;
    self.$el.find('#coin').val(coins.coin);

    self.enabled = coins.enabled || false;
    if(self.enabled){
      self.$el.find('.toggle .inactive').css({'display':'none'})
      self.$el.find('.toggle .active').css({'display':'block'})
    }else{
      self.$el.find('.toggle .inactive').css({'display':'block'})
      self.$el.find('.toggle .active').css({'display':'none'})
    }

  },

  clear: function(){

    var self = this;

    self.$el.removeClass('animated fadeInUp');
    self.$el.addClass('animatedQuick fadeOutUp');

    setTimeout(function(){

      self.$el.remove();

    }, 500);

  }

});
