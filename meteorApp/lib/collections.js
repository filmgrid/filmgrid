Movies = new Meteor.Collection('movies');

Movies.initEasySearch(['title'], {
    'limit' : 20
});
