module.exports = Backbone.View.extend({

  className: 'main_wallet main_wrap',

  initialize: function(){

    var self = this

    self.$el.html(ss.tmpl['main-wallet'].render()).appendTo('.dash .main').addClass('animated fadeInUp')

    self.fill_view()

    self.$el.find('input').on('keyup', self.update_settings.bind(self))
    self.$el.find('select').on('change', self.update_settings.bind(self))

  },

  update_settings: function(ev){

    var self = this
    
    //define settings object
    var wallet_settings = {
      provider: self.$el.find('#wallet_provider').val(),
      guid: self.$el.find('#wallet_guid').val(),
      password: self.$el.find('#wallet_password').val(),
      fromAddress: self.$el.find('#wallet_from_address').val()
    }

    self.user.set('wallet',  wallet_settings)

    self.user.once('saved:wallet', function (err) {
      var class_ = err ? 'failed-save' : 'successful-save';
      ev.target.classList.add(class_);
      setTimeout(function () {
        ev.target.classList.remove(class_);
      }, 500);
    });

  },

  fill_view: function(){ //fill feilds with current settings

    var self = this

    var wallet_settings = {
      provider: 'coinapult',
      guid: 'none',
      password: 'none',
      fromAddress: 'none'
    }

    var wallet = self.user.get('wallet') || wallet_settings

    self.$el.find('#wallet_provider').val(wallet.provider)
    self.$el.find('#wallet_guid').val(wallet.guid)
    self.$el.find('#wallet_password').val(wallet.password)
    self.$el.find('#wallet_from_address').val(wallet.fromAddress)

  },

  clear: function(){

    var self = this

    self.$el.removeClass('animated fadeInUp')
    self.$el.addClass('animatedQuick fadeOutUp')

    setTimeout(function(){

      self.$el.remove()

    }, 500)

  }

})
