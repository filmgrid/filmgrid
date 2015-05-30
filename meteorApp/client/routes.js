// =============================================================================
// FILMGRID - ROUTER
// =============================================================================


var routeConfig = { waitOn: function () {
  return { ready: function() { 
    if (Meteor.userId())
      return Meteor.user() != null;
    else
      return true;
  }};
}};

var cachedUserId = null;

function configureRoute(that, path, sort) {
  if (Session.get('type') !== path) {
    Session.set('type', path);
    Session.set('sort', sort);
    App.trigger('sortChange', sort);
    App.trigger('reload');
  }
  that.render('index', { data: { nav: path } });
}

Router.onBeforeAction(function() {
  if (Meteor.userId()) {
    this.next();
  } else {
    configureRoute(this, 'suggested', 'Popularity')
  };
}, { except: ['about'] });

Router.onAfterAction(function() {
  Session.set('showSidebar', false);
});

Router.route('/', function() {
  configureRoute(this, 'suggested', 'Recommended');
}, routeConfig);

Router.route('/watchlist', function() {
  configureRoute(this, 'bookmarked', 'Date added');
}, routeConfig);

Router.route('/favourites', function() {
  configureRoute(this, 'liked', 'Stars');
}, routeConfig);

Router.route('/disliked', function() {
  configureRoute(this, 'disliked|hidden', 'Date added');
}, routeConfig);

Router.route('/now-playing', function() {
  this.render('index', { data: { nav: "playing" }, waitOn: Meteor.user() });
}, routeConfig);

Router.route('/watch-with-friends', function() {
  this.render('index', { data: { nav: "friends" }, waitOn: Meteor.user() });
}, routeConfig);

Router.route('/about', function() {
  this.render('index', { data: { nav: "about" }, waitOn: Meteor.user() });
}, routeConfig);

Template.index.helpers({
  navSelectedIs: function(nav) {
    return _.indexOf(nav.split(','), this.nav) >= 0;
  }
});

Meteor.startup(function() {
  Session.keys = {}

  Session.set('activeMovie', {});
  Session.set('search', '');
  Session.set('filter', {});
  Session.set('loading', true);
  Session.set('type', '');

  Deps.autorun(function(){
    var user = Meteor.user();
    if (!user && cachedUserId) {
      cachedUserId = null;
      Session.set('loggedIn', false);
      App.trigger('reload')
    } else if (user && cachedUserId != user._id) {
      cachedUserId = user._id;
      Session.set('loggedIn', true);
      Session.set('actionCount', Meteor.user().profile.actions)
      Meteor.call('initialInsert', function() { App.trigger('reload'); });
    }
  });

  Deps.autorun(function() {
    if (!Session.get('loggedIn')) return;

    var remoteActionCount = (Meteor.user().profile.actions || 0);
    if (remoteActionCount > Session.get('actionCount')) {
      Session.set('actionCount', remoteActionCount)
      App.trigger('reload')
    }
  });

});


