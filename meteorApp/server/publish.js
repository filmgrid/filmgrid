function initialInsert(userId) {
  // Find the first set of movies to insert
  var suggested = Movies
  .find(
    {poster: { $ne: 'N/A' }, imdb_votes: { $ne: 'N/A' }},
    { sort: { imdb_votes: -1 }, fields : {_id: 1, title:1, poster:1, year:1, genre:1, runtime:1 }}
    )
  .fetch()
  .slice(0, 500)
  .map(function(e) {
    return [e._id, {
      id : e._id, 
      statusType:'suggested',
      proba : 1,
      title : e.title,
      poster : e.poster,
      year : e.year,
      genre : e.genre,
      runtime : e.runtime

    }];
  }); 

  Meteor.users.update({_id : userId}, { $set : { "profile.movies": _.object(suggested) }});
}

function subscribeToMovies(type, opts, userId) {

  if (Meteor.users.findOne({_id: userId}))
  {
    var opts = opts || {};
    var page = opts.page || 1;

    var movies = Meteor.users.findOne({_id: userId}).profile.movies;

    if (movies == undefined)
    {
      initialInsert( userId);
      return;
    }

    var ids = _.keys(movies);
    
    var search = { poster: { $ne: 'N/A' }, _id : { $in : ids } };
    if (opts.genre) search.genre = { $regex: '.*' + opts.genre + '.*' };
    var res = Movies.find(search, { limit: page * 20, sort: { year: -1 } });
    return res;
  }
};

Meteor.publish("movies", function(opts) 
{
    return subscribeToMovies("movies", opts, this.userId);
});
