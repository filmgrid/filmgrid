Movies.deny
(
	{
		update : function() { return true},
		insert : function() { return true},
		remove : function() { return true}
	}
);

Meteor.users.allow(
	{
		update: function (userId, doc, fields, modifier) {
			console.log(userId);
		    return doc._id === userId;
	 	}
	}
);

Meteor.users.deny( 
	{
		insert : function() { return true},
		remove : function() { return true}
	}
);
