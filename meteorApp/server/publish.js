function initialInsert(userId) {
  // Find the first set of movies to insert
  var suggested = Movies
  .find(
    {poster: { $ne: 'N/A' }, imdb_votes: { $ne: 'N/A' }},
    { sort: { revenue: -1 }, fields : {
      _id: 1,

      title: 1,
      plot: 1,
      genre: 1,

      runtime : 1,
      budget : 1,
      revenue : 1,

      year : 1,
      released : 1,
      languages : 1,
      country : 1,

      score_rtaudience : 1,
      score_rtcritics : 1,
      score_imdb : 1,
      score_metascore : 1,
      votes_imdb : 1,

      awards : 1,
      rating : 1,

      actors : 1,
      directors : 1,
      studio : 1,
      studio : 1,

      link_rt : 1,
      link_imdb : 1,
      homepage : 1,

      poster : 1,
      poster_1 : 1,
      background : 1
  }})
  .fetch()
  .slice(0, 500)
  .map(function(e) {
    return [e._id, {
      id : e._id, 
      statusType:'suggested',
      statusScore: '',
      proba : 1,

      title : e.title,
      plot : e.plot,
      genre : e.genre,

      runtime : e.runtime,
      budget : e.budget,
      revenue : e.revenue,

      year : e.year,
      released : e.released,
      languages : e.languages,
      country : e.country,

      score_rtaudience : e.score_rtaudience,
      score_rtcritics : e.score_rtcritics,
      score_imdb : e.score_imdb,
      score_metascore : e.score_metascore,
      votes_imdb : e.votes_imdb,

      awards : e.awards,
      rating : e.rating,

      actors : e.actors,
      directors : e.directors,
      studio : e.studio,
      studio : e.studio,

      link_rt : e.link_rt,
      link_imdb : e.link_imdb,
      homepage : e.homepage,

      poster : e.poster,
      poster_1 : e.poster_1,
      background : e.background
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

    /*var ids = _.keys(movies);
    
    var search = { poster: { $ne: 'N/A' }, _id : { $in : ids } };
    if (opts.genre) search.genre = { $regex: '.*' + opts.genre + '.*' };
    var res = Movies.find(search, { limit: page * 20, sort: { year: -1 } });
    return res;*/
  }
};

Meteor.publish("movies", function(opts) 
{
    return subscribeToMovies("movies", opts, this.userId);
});
