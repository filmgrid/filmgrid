if (Meteor.isServer) {
    Meteor.startup(function () {
    	var Movies = new Meteor.Collection("movies");
        if(Movies.find().count() === 0){
            var movies = JSON.parse(Assets.getText("movie_data.json"));
            for (i=0; i<movies.length; ++i) {
                Movies.insert(movies[i]);
            }
        }
    });
}