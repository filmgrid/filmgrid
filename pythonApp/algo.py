

status = dict({
	'liked3': 3,
	'liked2': 2,
	'liked1': 0,
	'disliked': -2,
	'bookmarked': 1,
	'dismissed': 0
});

def computePreferences(userMovies):
	genres = dict()

	for m in userMovies:
		norm = 1.0/len(m.genres);
		weight = status[m.statusType + m.statusScore]
		for g in userMovies.genres:
			if (not g in genres) genres[g] = 0.0;
			genres[g] += weight*norm

	n = len(userMovies)
	for g in genres:
		genres[g] /= n

	return genres;


def getMovieScore(userGenres, movie):
	score = 0
	norm = len(m.genres)

	for (g in movie.genres):
		score += userGenres(g)/norm




def findRecommendations(userGenres, allMovies):




