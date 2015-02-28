
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
    }
    else
    {
      Session.set('activeMovie', this);
    }
    Session.set('flipped', false);
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
    return this.id === Session.get('activeMovie').id ? 'open' : '';
  },

  flippedClass: function() {
    return this.id === Session.get('activeMovie').id && Session.get('flipped') ? 'flipped' : '';
  },

  hasTrailer: function() {
    return !!this.trailer_youtube;
  },

  showTrailer: function() {
    return this.id === Session.get('activeMovie').id && Session.get('flipped');
  },

  status: function() {
    Session.get('activeMovie');
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
  }
  else
  {
    movie.statusType = status.type
    movie.statusScore = status.score ? status.score : '';
    $set['profile.movies.' + movie.id] = movie;
  }
    
  Meteor.users.update(
     {_id : Meteor.userId()},
      {$set : $set }
    );      
  if (interactions % 5 == 0)
  {
    Meteor.call('recomputePreferences');
  }
  interactions++;
  Session.set('rePosition', true);
}

