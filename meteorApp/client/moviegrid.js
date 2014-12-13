if (Meteor.isClient) {
	var Movies = new Meteor.Collection("movies");
	
	Template.moviegrid.helpers( 
		{
			movies : function() {
				return Movies.find({});
			}
		}
	);
}


/*
plot
rated
language
title
country
writer
year
metascore
director
released
imdb_rating
awards
genre
actors
runtime
type
*/