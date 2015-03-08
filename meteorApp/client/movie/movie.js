var $window = $(window);

var interactions = 0;

Template.movie.events = {
  'click .movie-bookmark' : function (e) {

    updateFromProfile(this, {type : 'bookmarked'} );
  },

  'click .movie-like3' : function (e) {
    $(e.target.parentNode.parentNode).removeClass('movie-user-status-liked1 movie-user-status-liked2').addClass('movie-user-status-liked3');
    updateFromProfile(this, {type : 'liked', score : 3});
  },

  'click .movie-like2' : function (e) {
    $(e.target.parentNode.parentNode).removeClass('movie-user-status-liked1 movie-user-status-liked3').addClass('movie-user-status-liked2');
    updateFromProfile(this, {type : 'liked', score : 2});
  },

  'click .movie-like1' : function (e) {
    $(e.target.parentNode.parentNode).removeClass('movie-user-status-liked3 movie-user-status-liked2').addClass('movie-user-status-liked1');
    updateFromProfile(this, {type : 'liked', score : 1});
  },

  'click .movie-dismissed' : function (e) {
    updateFromProfile(this, {type : 'dismissed'} );
  },

  'click .movie-poster-shadow': function(e) {
    var activeMovie = Session.get('activeMovie');
    
    if (activeMovie.id)
      Session.set('previousActiveId', activeMovie.id);

    if (this.id === activeMovie.id) 
    {
      Session.set('previousActiveId', null);
      Session.set('activeMovie', {});
      Session.set('activeMovie'+this.id, false);
    }
    else
    {
      if (activeMovie)
      {
        Session.set('activeMovie'+activeMovie.id, false);
      }
      Session.set('activeMovie', this);
      Session.set('activeMovie'+this.id, true);
    }
    Session.set('flipped', false);
    Session.set('rePosition', this.id); // we ask for rePosition but false because we don't want the order to change
  },

  'click .trailer': function(e) {
    Session.set('flipped', true);
  },

  'click .trailer-return': function(e) {
    Session.set('flipped', false);
  }
}

Template.movie.helpers({
  openClass: function() {
    return Session.get('activeMovie'+this.id) ? 'open' : '';
  },

  flippedClass: function() {
    return Session.get('activeMovie'+this.id) && Session.get('flipped') ? 'flipped' : '';
  },

  hasTrailer: function() {
    return !!this.trailer_youtube;
  },

  showTrailer: function() {
    return Session.get('activeMovie'+this.id) && Session.get('flipped');
  },

  status: function() {
    var a = Session.get('updateMovie'+this.id);
    if (a) Session.set('updateMovie'+this.id, false);
    return this.statusType + this.statusScore;
  }
});

function updateFromProfile(movie, status)
{   
  var $set = {};
  var statusType = movie.statusType;
  // Let's check that we can access the current status
  if (!statusType) {
    console.log("This is strange Dr Watson, the id you asked for is not referenced in the user profile");
    return;
  } 

  // Let's put it back in suggested if it is unclicked from dismissed or bookmarked
  if (status.type === statusType && status.type != 'liked' ) {
    movie.statusType = "suggested";
    movie.statusScore = "";
    $set['profile.movies.' + movie.id]  = movie;
    bounceNav("suggested");   
  }
  else
  {
    movie.statusType = status.type
    movie.statusScore = status.score ? status.score : '';
    $set['profile.movies.' + movie.id] = movie;
    if (!(status.type === statusType && status.type == 'liked')) bounceNav(status.type); // bounce the nav except if
  }
  // Re position : the clicked stuff should disappear
  Session.set('activeMovie'+movie.id, false);
  Session.set('updateMovie'+movie.id, true);
  Session.set('reCompute', true);

  Meteor.users.update(
     {_id : Meteor.userId()},
      {$set : $set }
    );
  

  if (interactions % 5 == 0)
  {
    Meteor.call('recomputePreferences');
  }
  interactions++;
  
  var activeMovie = Session.get('activeMovie')
  if (activeMovie.id === movie.id)
  {
    Session.set('activeMovie', {});
  }
}

function bounceNav(type)
{
  var el= $('#nav-link-'+type);
  el.addClass("bouncy-nav");
  setTimeout(function() {el.removeClass("bouncy-nav")}, 500);
}