/*Template.movie.helpers({
  userStatus : function () {
    var movie = Session.get('userMovies')[this._id];
    var score = movie.statusScore ? movie.statusScore : '';    
    return movie.statusType + score;
}});
*/


Template.movie.events = {
    'click .movie-bookmark' : function () {
      updateFromProfile(this.id, {type : 'bookmarked'} );
    },

    'click .movie-like4' : function () {
      updateFromProfile(this.id, {type : 'liked', score : 4});
    },


    'click .movie-like3' : function () {
      updateFromProfile(this.id, {type : 'liked', score : 3});
    },


    'click .movie-like2' : function () {
      updateFromProfile(this.id, {type : 'liked', score : 2});
    },


    'click .movie-like1' : function () {
      updateFromProfile(this.id, {type : 'liked', score : 1});
    },

    'click .movie-dismissed' : function () {
      updateFromProfile(this.id, {type : 'dismissed'} );
    },
}


function updateFromProfile(id, status)
{ 
  console.log('tic update');
  var $set = {};
  $set['profile.movies.' + id + '.statusType' ]  = status.type;
  $set['profile.movies.' + id + '.statusScore' ] = status.score ? status.score : '';
  
  Meteor.users.update(
     {_id : Meteor.userId()},
      {$set : $set }
    );    
  console.log('toc update') ;
}

