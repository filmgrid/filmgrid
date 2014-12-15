Template.movie.events = {
    'click .bookmark' : function () {
      Meteor.users.update({_id : Meteor.userId()}, { $pull : { 'profile.movies.suggested' : this._id }});
      Meteor.users.update({_id : Meteor.userId()}, { $push : { 'profile.movies.starred' : this._id }});
    }
}

