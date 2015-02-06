
var $window = $(window);

Template.movie.events = {
  'click .movie-bookmark' : function (e) {
    updateFromProfile(this.id, {type : 'bookmarked'} );
  },

  'click .movie-like3' : function (e) {
    updateFromProfile(this.id, {type : 'liked', score : 3});
  },

  'click .movie-like2' : function (e) {
    updateFromProfile(this.id, {type : 'liked', score : 2});
  },

  'click .movie-like1' : function (e) {
    updateFromProfile(this.id, {type : 'liked', score : 1});
  },

  'click .movie-dismissed' : function (e) {
    updateFromProfile(this.id, {type : 'dismissed'} );
  },

  'click .movie-poster-shadow': function(e) {
    var m = (this.id === Session.get('activeMovie').id) ? {} : this;
    Session.set('activeMovie', m);
  }
}

Template.movie.helpers({
  openClass: function() {
    return this.id === Session.get('activeMovie').id ? 'open' : '';
  }
});

function updateFromProfile(id, status)
{   
  var $set = {};
  var statusType = Meteor.user().profile.movies[id].statusType;
  
  // Let's check that we can access the current status
  if (!statusType) {
    console.log("This is strange Dr Watson, the id you asked for is not referenced in the user profile");
    return;
  } 

  // Let's put it back in suggested if it is unclicked from dismissed or bookmarked
  if (status.type === statusType && status.type != 'liked' ) {
    $set['profile.movies.' + id + '.statusType' ]  = 'suggested';
    $set['profile.movies.' + id + '.statusScore' ] = '';        
  }
  else
  {
    // Otherwise let's simply update
    $set['profile.movies.' + id + '.statusType' ]  = status.type;
    $set['profile.movies.' + id + '.statusScore' ] = status.score ? status.score : '';
  }
    
  Meteor.users.update(
     {_id : Meteor.userId()},
      {$set : $set }
    );      

  Meteor.call('recomputePreferences');
}

