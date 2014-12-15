Deps.autorun(function(){
	Meteor.subscribe('moviesSuggested', Session.get('query') );  
	Meteor.subscribe('moviesDisliked', Session.get('query') );  
	Meteor.subscribe('moviesLiked', Session.get('query') );  
	Meteor.subscribe('moviesStarred', Session.get('query') );  
	Meteor.subscribe('moviesDismissed', Session.get('query') );  
});