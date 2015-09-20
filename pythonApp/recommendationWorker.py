from __future__ import division
import sklearn
from pymongo import MongoClient
import sys
sys.path.insert(0, '/Users/tdelteil/Projects/Filmgrid/pythonApp/vendor/mongoqueue')
from mongoqueue import MongoQueue
import time
import string
from random import randint
import argparse

def getMovies(userId):
	return client.appdb.users.find_one({"_id":userId},{"profile.movies" : 1})["profile"]["movies"]   

def updateMovies(userId, newMovies, myMovies):
    newSet = dict()
    for m in myMovies.values():
        if (m['statusType'] != 'suggested'):
            newSet[m["id"]] = m
    missing = max(100,len(myMovies) - len(newSet));
    count = 0
    for m in newMovies:
        if (count >= missing):
            break
        if (m["_id"] not in newSet):
            m["statusType"] = 'suggested'
            m["statusScore"] = ''
            m["id"] = m["_id"]
            newSet[m["_id"]] = m
            count = count + 1
    client.appdb.users.update({"_id" : userId}, {"$set" : {'profile.new_movies':newSet}})

def computePreferences(userMovies, features):
    preferences = dict()
    for feature in features:
        preferences[feature] = dict()

    count = 0
    for movie in userMovies:
        weight = status[movie['statusType'] + str(movie['statusScore'])]
        if (weight != 0):
            count = count+1
            for feature in features:
                if (feature in movie and movie[feature]):
                    f = string.split(movie[feature],', ') #split the string to make it an array
                    if (len(f)):
                        norm = 1.0/len(f)

                        for item in f:
                            if (item not in preferences[feature]):
                                preferences[feature][item] = 0.0;
                            preferences[feature][item] += weight*norm

    for feature in preferences:
        for item in preferences[feature]:
            preferences[feature][item] /= count
    return preferences


def getMovieScore(userPreferences, movie):
    scores = dict()
    for feature in userPreferences:
        scores[feature] = 0.1
        features = movie[feature+'s'] if (feature+'s' in movie) else movie[feature] if feature in movie else []
        norm = len(features)
        for f in features:
            if (f in userPreferences[feature]):
                scores[feature] += userPreferences[feature][f]/norm
        
    
    revenue = min(10000000,max(movie['revenue'], 1000000))
    rating = 0.5
    if ('score_imdb' in movie):
        rating = movie['score_imdb'] / 10
    elif ('score_rtcritics' in movie):
        rating = movie['score_rtcritics'] / 100
    elif ('score_metascore' in movie):
        rating = movie['score_metascore'] / 100
        
    sumScore = 0
    for score in scores:
        sumScore += scores[score]*featuresWeight[score]
    
    return sumScore * revenue * rating


def findRecommendations(userGenres, allMovies):
    sort = sorted(allMovies, key=lambda s: -getMovieScore(userGenres, s) )[0:500]
    return sort[0:500]


if __name__ == "__main__":

	parser = argparse.ArgumentParser(description='Compute Recommendation of filmgrid users')
	parser.add_argument('--uri', default='mongodb://localhost/appdb',
	                   help='The uri of the mongo connection')
	parser.add_argument('--name', help='The name of the consumer', default="consumer-1")
	parser.add_argument('--sleep', type=int, help='The time it sleeps between 2 jobs', default=1)

	args = parser.parse_args()

	uri = args.uri
	sleepTime = args.sleep
	name = args.name

	# Create the objects
	client = MongoClient(uri)
	queue = MongoQueue(client.appdb.jobqueue, consumer_id=name, timeout=300, max_attempts=3)
	allMovies = list(client.appdb.movies.find({},{'genres':1,'title':1,'rating':1,'directors':1,'score_metascore':1,
                                              'score_rtcritics':1, 'score_imdb':1,'revenue':1,'_id':1, 'poster':1,
                                              'poster_1':1,'plot':1,'directors':1,'actors':1,'genre':1,'runtime':1,
                                              'link_imdb':1,'link_rt':1,'changed':1,'year':1,'trailer_youtube':1}))
	status = dict({
	    'suggested': 0,
	    'liked3': 3,
	    'liked2': 2,
	    'liked1': 0,
	    'disliked': -2,
	    'bookmarked': 1,
	    'hidden': 0,
	})

	features = ["genre", "rating"]
	featuresWeight = {'genre': 1, 'rating':1, 'directors':2}

	######### ACTUAL WORKER LOOP #############

	print "Starting worker " + name
	count = 0;
	######### Make it run for only 10 minutes #######
	while(count < 600/sleepTime):
	    count = count + 1
	    job = queue.next()
	    while(job):
	        t0 = time.time()
	        userId = job.payload["userId"]
	        myMovies = getMovies(userId)
	        myMoviesValue = myMovies.values();
	        myPreferences = computePreferences(myMoviesValue, features)
	        myRecommendations = findRecommendations(myPreferences, allMovies)
	        updateMovies(userId, myRecommendations, myMovies)
	        job.complete()
	        job = queue.next()
	        print (time.time() -t0)
    	    time.sleep(sleepTime);

