Jobqueue = new Meteor.Collection('jobqueue');

Meteor.methods({
  recomputePreferences: recomputePreferences,
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
