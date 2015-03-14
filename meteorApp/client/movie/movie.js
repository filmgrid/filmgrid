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
    Session.set('activeMovie', this.id === activeMovie.id ? {} : this);
    Session.set('flipped', false);
    App.trigger('reposition');
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
    return Session.get('activeMovie').id === this.id ? 'open' : '';
  },

  flippedClass: function() {
    return Session.get('activeMovie').id === this.id && Session.get('flipped') ? 'flipped' : '';
  },

  hasTrailer: function() {
    return !!this.trailer_youtube;
  },

  showTrailer: function() {
    return Session.get('activeMovie').id === this.id && Session.get('flipped');
  },

  status: function() {
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
    flash($('#nav-link-suggested'), 'bounce');   
  }
  else
  {
    movie.statusType = status.type
    movie.statusScore = status.score ? status.score : '';
    $set['profile.movies.' + movie.id] = movie;
    if (!(status.type === statusType && status.type == 'liked')) flash($('#nav-link-' + status.type), 'bounce'); // bounce the nav except if
  }

  // Re position : the clicked stuff should disappear
  if (Session.get('activeMovie').id === movie.id) Session.set('activeMovie', {});
  App.trigger('recompute');

  Meteor.users.update(
     {_id : Meteor.userId()},
      {$set : $set }
    );
  

  if (interactions % 5 == 0)
  {
    Meteor.call('recomputePreferences');
  }
  interactions++;
}
