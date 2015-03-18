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

function configureRoute(that, path, sort) {
  if (Session.get('type') !== path) {
    Session.set('type', path);
    App.trigger('sortChange', sort);
    App.trigger('reload');
    Session.set('showSidebar', false);
  }
  that.render('movies', { data: { nav: path } });
}

Router.onBeforeAction(function() {
  if (Meteor.userId()) {
    this.next();
  } else {
    configureRoute(this, 'suggested', 'popularity')
  };
}, { except: ['about'] });

Router.route('/', function() {
  configureRoute(this, 'suggested', 'score');
}, routeConfig);

Router.route('/watchlist', function() {
  configureRoute(this, 'bookmarked', 'added');
}, routeConfig);

Router.route('/favourites', function() {
  configureRoute(this, 'liked', 'stars');
}, routeConfig);

Router.route('/disliked', function() {
  configureRoute(this, 'disliked', 'added');
}, routeConfig);

Router.route('/now-playing', function() {
  configureRoute(this, 'playing', 'score');
}, routeConfig);

Router.route('/watch-with-friends', function() {
  configureRoute(this, 'friends', 'score');
}, routeConfig);

Router.route('/about', function() {
  this.render('about', { data: { nav: "about" }, waitOn: Meteor.user() });
}, routeConfig);

Meteor.startup(function() {
  Session.set('activeMovie', {});
  Session.set('type', null);
  Session.set('search', '');
  Session.set('filter', {});

  Session.set('showSidebar', false);
  Session.set('showSubnav', false);

  Deps.autorun(function(){
    var userId=Meteor.userId();
    App.trigger('reload');
    Meteor.call('initialInsert', function() { App.trigger('reload');});
  });
});


