
Jobqueue = new Meteor.Collection('jobqueue');

Meteor.methods({
  recomputePreferences: recomputePreferences,
  searchMovies        : searchMovies 
});

function recomputePreferences()
{
  if (! this.userId) {
    throw new Meteor.Error("not-logged-in",
      "Must be logged in to add to the job queue.");
  }

  console.log("trying to upsert");
  
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
        title : 1,
        poster : 1,
        plot : 1,
        actors : 1,
        year : 1,
        genre : 1,
        runtime : 1
      }
      // limit : 3
   }
   , function(error, results) {
      if (results && results.documents[0].ok === 1) {
          future['return'](results.documents[0].results);
      }
      else {
          future['return']('');
      }
  });
  return future.wait();
}
