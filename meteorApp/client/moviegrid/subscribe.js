Deps.autorun(function(){
  Meteor.subscribe('allMovies', Session.get('query') );  
});