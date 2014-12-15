Deps.autorun(function(){
  Meteor.subscribe('movies', Session.get('query') );  
});