
Jobqueue = new Meteor.Collection('jobqueue');

Meteor.methods({
  recomputePreferences: function () {
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
  },

});