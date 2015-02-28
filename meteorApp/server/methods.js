
Jobqueue = new Meteor.Collection('jobqueue');

Meteor.methods({
  recomputePreferences: recomputePreferences,
  searchMovies        : searchMovies,
  updateUserStatus    : updateUserStatus
});

function updateUserStatus($set)
{
  Meteor.users.update(
     {_id : this.userId},
      {$set : $set }
  );
}

function recomputePreferences()
{
  if (! this.userId) {
    throw new Meteor.Error("not-logged-in",
      "Must be logged in to add to the job queue.");
  }

  console.log("trying to upsert RECOMPUTING !!!!!");
  
  Jobqueue.upsert(
    {'payload.userId':this.userId},
    {   $set: 
      {
        payload:{userId:this.userId}, 
        priority:1, 
        time:null, 
        period:0,
        locked_at:null,
        locked_by:null,
        last_error:null,
        attempts:0
      }
    });


  console.log("upserted");

  return null;
}

var driver = new MongoInternals.RemoteCollectionDriver("mongodb://127.0.0.1:27017/appdb");

function searchMovies(searchString)
{
  if (!searchString) return [];

  var Future = Npm.require('fibers/future');
  var future = new Future();

  driver.mongo.db.executeDbCommand({
      text: 'movies',
      search: searchString,
      project: {
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
      trailer_youtube : 1,

      poster : 1,
      poster_1 : 1,
      background : 1
      }
      , limit : 25
   }
   , function(error, results) {

      console.log(results);
      if (results && results.documents[0].ok === 1) {
          future['return'](results.documents[0].results);
      }
      else {
          future['return']('');
      }
  });
  return future.wait();
}
