function initialInsert(userId) {
  // Find the first set of movies to insert
  var suggested = Movies
  .find(
    {poster: { $ne: 'N/A' }, imdb_votes: { $ne: 'N/A' }},
    { limit: 300, sort: { imdb_votes: -1 }, fields : {_id: 1 }}
    ).fetch()
  .map(function(e) { return e._id;});

  var movies = {
    suggested : suggested,
    liked     : [],
    disliked  : [],
    dismissed : [],
    starred   : []
  };
  console.log("hello");
  Meteor.users.update({_id : userId}, { $set : { "profile.movies": movies }});
}

Meteor.publish("movies", function(opts) {
  if (Meteor.users.findOne({_id:this.userId}))
  {
    var opts = opts || {};
    var page = opts.page || 1;

    var movies = Meteor.users.findOne({_id:this.userId}).profile.movies;

    if (movies == undefined)
    {
      initialInsert(this.userId);
      return;
    }

    var suggested = movies.suggested || [];
    var liked     = movies.liked     || [];
    var disliked  = movies.disliked  || [];
    var dismissed = movies.dismissed || [];
    var starred   = movies.starred   || [];

    var ids = suggested.concat(liked).concat(disliked).concat(dismissed).concat(starred);

    // TODO For now, only show movies with poster
    // TODO Add additional filters
    // TODO Sort by match certainty instead of year
    var search = { poster: { $ne: 'N/A' }, _id : { $in : ids } };
    if (opts.genre) search.genre = { $regex: '.*' + opts.genre + '.*' };
    var res = Movies.find(search, { limit: page * 20, sort: { year: -1 } });

    return res;
  }
});

