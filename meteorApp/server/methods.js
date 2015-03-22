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
  payload = {userId:this.userId};
  Jobqueue.upsert(
    {'payload' : payload},
    {   $set: 
      {
        payload:payload, 
        priority:1, 
        time:null, 
        period:0,
        locked_at:null,
        locked_by:null,
        last_error:null,
        attempts:0
      }
    });
  
  return null;
}
