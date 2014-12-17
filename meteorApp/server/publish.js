function initialInsert(userId) {
  // Find the first set of movies to insert
  var suggested = Movies
  .find(
    {poster: { $ne: 'N/A' }, imdb_votes: { $ne: 'N/A' }},
    { sort: { imdb_votes: -1 }, fields : {_id: 1 }}
    ).fetch()
  .map(function(e) { return e._id;});

  var movies = {
    suggested : suggested.slice(0, 300),
    liked     : [],
    disliked  : [],
    dismissed : [],
    starred   : []
  };
  console.log("hello");
  Meteor.users.update({_id : userId}, { $set : { "profile.movies": movies }});
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

    var ids = movies[type];
    
    console.log(ids);
    var search = { poster: { $ne: 'N/A' }, _id : { $in : ids } };
    if (opts.genre) search.genre = { $regex: '.*' + opts.genre + '.*' };
    var res = Movies.find(search, { limit: page * 20, sort: { year: -1 } });
    return res;
  }
};

Meteor.publish("moviesSuggested", function(opts) 
{
    return subscribeToMovies("suggested", opts, this.userId);
});

Meteor.publish("moviesLiked", function(opts)
{
    return subscribeToMovies("liked", opts, this.userId);
});

Meteor.publish("moviesDisliked", function(opts) 
{
    return subscribeToMovies("disliked", opts, this.userId);
});

Meteor.publish("moviesStarred", function(opts) 
{
    return subscribeToMovies("starred", opts, this.userId);
});

Meteor.publish("moviesDismissed", function(opts) 
{
    return subscribeToMovies("dismissed", opts, this.userId);
});
