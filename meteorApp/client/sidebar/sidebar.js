// =================================================================================================
// FILMGRID - SIDEBAR
// =================================================================================================


var $sidebar;

Template.sidebar.events = {
  'click #mobile-menu': function() {
    Session.set('showSidebar', !Session.get('showSidebar'));
  },
  'click #subnav-link': function() {
    Session.set('showSubnav', !Session.get('showSubnav'));
  },
  'click #logout-button': function() {
    Meteor.logout();
  }
};

Template.sidebar.helpers({
  navSelectedIs: function(nav) {
    return nav === this.nav;
  },
  filtersClass: function() {
    return this.nav == 'about' ? 'hidden' : '';
  },
  subnavClass: function() {
    return Session.get('showSubnav') ? 'open' : '';
  },
  showSidebar: function() {
    return Session.get('showSidebar') === true;
  },
  services: function() {
    // Hack to get access to internal function in accounts-ui-unstyled
    return Template._loginButtonsLoggedOutAllServices.__helpers[' services']();
  },
  isNotLoading: function() {
    return !Session.get('loading');
  }
});

Template.sidebar.rendered = function() {
  
  $sidebar = $('#sidebar');

  touchSlider($('#sidebar-in-target'), {
    onMove: function(x) {
      Session.set('showSidebar', 'sliding');
      $sidebar.css('transform', 'translateX(' + bound(x, -240, 0) + 'px)')
    },
    onEnd: function(x) {
      Session.set('showSidebar', x < -100)
    }
  });
  
  touchSlider($('#sidebar-out-target'), {
    onMove: function(x) {
      Session.set('showSidebar', 'sliding');
      $sidebar.css('transform', 'translateX(' + bound(x - 240, -240, 0) + 'px)')
    },
    onEnd: function(x) {
      Session.set('showSidebar', Math.abs(x) > 5 && x < 60)
    }
  });

};

Deps.autorun(function() {
  var show = Session.get('showSidebar');
  if (!$sidebar || show === 'sliding') return;

  $sidebar.css('transition', 'transform .4s');
  $sidebar.one('transitionend webkitTransitionEnd', function() { $sidebar.css('transition', ''); });

  document.body.offsetTop;
  $sidebar.css('transform', 'translateX(' + (show ? '-240' : '0') + 'px)');
});
