Template.movie.events = {
    'click .movie-bookmark' : function () {
      updateFromProfile(this._id, 'bookmarked');
    },

    'click .movie-like-4' : function () {
      updateFromProfile(this._id, 'liked-4');
    },


    'click .movie-like-3' : function () {
      updateFromProfile(this._id, 'liked-3');
    },


    'click .movie-like-2' : function () {
      updateFromProfile(this._id, 'liked-2');
    },


    'click .movie-like-1' : function () {
      updateFromProfile(this._id, 'liked-1');
    },

    'click .movie-dismissed' : function () {
      updateFromProfile(this._id, 'dismissed');
    },
}


function updateFromProfile(id, status)
{  
    var movie = _.find(Meteor.user().profile.movies, function(e) { return e.id === id; });

    Meteor.users.update(
      {_id : Meteor.userId()},
      { $pull : { 'profile.movies': movie}}
    );

    console.log(movie);

    movie.status = status;

    Meteor.users.update(
      {_id : Meteor.userId()},
      {$push : { 'profile.movies' : movie}}
    );    
        
}

