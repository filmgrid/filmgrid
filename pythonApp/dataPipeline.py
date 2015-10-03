import json
import urllib
import urllib2
import requests
import zipfile
import csv
import sys
import difflib
import string
import time
import re
import tmdbsimple as tmdb  # pip install tmdbsimple
import rtsimple as rt  # pip install rtsimple
from pymongo import MongoClient
from functools import partial


# Set some constants
omdbFile     = "omdb/omdbMovies.txt"
rawOmdbFile  = "raw_omdb.json"
rawTmdbFile  = "raw_tmdb.json"
rawRtFile    = "raw_rt.json"
movieFile    = "movie_data.json"
meteorPath   = "../meteorApp/private/movie_data.json"
uri          = 'mongodb://localhost/appdb'

tmdb.API_KEY = '2a50430216cd531275198faae3531bb4'
tmdbImages = tmdb.Configuration().info()['images']
rt.API_KEY = 'dbbykgj6pbm3wnfrnvhdbdym'


# readcsv function
def readcsv(path):
    f = open(path, "rb")
    rawdata = csv.reader(f, delimiter="\t")
    data = []
    keys = rawdata.next()
    for row in rawdata:
        item = dict()
        for i in range(len(keys)):
            if len(row) > i:
                item[keys[i]] = row[i].decode("utf-8", "ignore").strip()
            else:
                item[keys[i]] = None
        data.append(item)
    return dat

def loadFromTmdb(filePath, hardReset, omdbMovies):
    
    if not hardReset:
        tmdbMovies = json.load(open(filePath, 'r'))
    else:
        tmdbMovies = dict()
        
    
    i = 0
    for m in omdbMovies:
        i += 1
   
        imdbID = m["ImdbID"]
        if (imdbID in tmdbMovies): continue

        print("tmdb" + str(i))
        sys.stdout.flush()

        data = keywords = videos = None
        try:
            data = tmdb.Movies("tt" + imdbID).info()
            keywords = tmdb.Movies(data['id']).keywords()['keywords']
            videos = tmdb.Movies(data['id']).videos()['results']
            # titles = tmdb.Movies(data['id']).alternative_titles()
            # cast = tmdb.Movies(fromTmdb['id']).credits()['cast']
            # crew = tmdb.Movies(fromTmdb['id']).credits()['crew']
            # images = tmdb.Movies(fromTmdb['id']).images()
        except requests.HTTPError as e:
            if e.message == '404 Client Error: Not Found':
                tmdbMovies[imdbID] = False
                continue
            else:
                print('HTTP Error')
                return

        tmdbMovies[imdbID] = dict({
            "Adult":      data["adult"] or None,
            "Backdrop":   tmdbImages['base_url'] + 'original' + str(data['backdrop_path']) if data["backdrop_path"] else None,
            "Budget":     data["budget"] or None,
            "Genres":     [g["name"] for g in data["genres"]],
            "Homepage":   data["homepage"] or None,
            "Languages":  [g["name"] for g in data["spoken_languages"]],
            "Tagline":    data["tagline"] or None,
            "Title":      data["title"] or None,
            "Poster":     tmdbImages['base_url'] + 'w185' + data["poster_path"] if data["poster_path"] else None,
                          # can use 'original', u'w92', 'w154', 'w185', 'w342', 'w500', 'w780'
            "Studios":    [g["name"] for g in data["production_companies"]],
            "Overview":   data["overview"] or None,
            "Popularity": data["popularity"] or None,
            "Released":   data["release_date"] or None,
            "Revenue":    data["revenue"] or None,
            "Runtime":    data["runtime"] or None,
            "TmdbRating": data["vote_average"] or None,
            "TmdbVotes":  data["vote_count"] or None,
            "Keywords":   [k["name"] for k in keywords],
            "Videos":     [dict({ "key": v["key"], "type": v["type"], "site": v["site"] }) for v in videos]
        });
    return tmdbMovies

def saveTmdb(tmdbMovies, filePath):
    json.dump(tmdbMovies, open(filePath, 'w'), indent=4)

def loadFromRt(filePath, hardReset, omdbMovies):
    
    if not hardReset:
        rtMovies = json.load(open(filePath, 'r'))
    else:
        rtMovies = dict()
        
    i = 0
    errorCount = 0
    for m in omdbMovies:
        i += 1
        
        if errorCount >= 10:
            return rtMovies
        
        imdbID = m["ImdbID"]
        if (imdbID in rtMovies and rtMovies[imdbID] != False): continue
        print("Rotten Tomatoes " + str(i))
        sys.stdout.flush()
        
        try:
            data = rt.Alias().movie(type='imdb', id=imdbID)
        except requests.HTTPError as e:
            rtMovies[imdbID] = False
            print("HTTPError")
            errorCount = errorCount + 1
            continue
        rtID = data['id'];
        
        # videos = rt.Movies(rtID).clips()['clips']
        # reviews = rt.Movies(fromRt['id']).reviews()
        # cast = rt.Movies(fromRt['id']).cast()['cast']
        
        rtMovies[imdbID] = dict({
            "Cast":        [dict({ "name": c["name"], "character": c["characters"] if "characters" in c else None })
                            for c in data["abridged_cast"]],
            "Directors":   [g["name"] for g in data["abridged_directors"]] if "abridged_directors" in data else [],
            "Genres":      data["genres"] or [],
            "RtID":        data["id"],
            "Rating":      data["mpaa_rating"].replace("N/A", "") or None,
            "Consensus":   (data["critics_consensus"] or None) if "critics_consensus" in data else None,
            "Posters":     data["posters"],
            "LinkRt":      data['links']['alternate'] if 'alternate' in data['links'] else None,

            "RtAudience":  data["ratings"]["audience_score"] if data["ratings"]["audience_score"] > 0 else None,
            "RtCritics":   data["ratings"]["critics_score"] if data["ratings"]["critics_score"] > 0 else None,

            "ReleasedDVD": data["release_dates"]["dvd"] if "dvd" in data["release_dates"] else None,
            "Released":    data["release_dates"]["theater"] if "theater" in data["release_dates"] else None,

            "Runtime":     data["runtime"] or None,
            "Studio":      data["studio"] if "studio" in data else None,
            "Synopsis":    data["synopsis"] or None,
            "Title":       data["title"] or None,
            "Year":        data["year"] or None
        });
    rtMovies['0088199'] = False #automagic
    return rtMovies

def saveRt(fromRt, filePath):
    json.dump(fromRt, open(filePath, 'w'), indent=4)

def sanitize(fromOmdb, fromTmdb, fromRt):
    movies = []
    for m in fromOmdb:
        imdbID = m['ImdbID']
        if imdbID in fromTmdb and imdbID in fromRt and fromRt[imdbID] and fromTmdb[imdbID]:
            movies.append(formatMovie(imdbID, m, fromRt[imdbID], fromTmdb[imdbID]))
    return movies        

def saveMovies(movies, filePath, meteorPath):
    json.dump(movies, open(filePath, 'w'), indent=4)
    json.dump(movies, open(meteorPath, 'w'), indent=4)
    
def updateMovies(movies):
    #Don't run this, use Meteor instead!
    client = MongoClient(uri)
    
    for movie in movies:
        cursor = client.appdb.movies.find({"link_imdb": movie['link_imdb']})
        if cursor.count() == 0:
            movie['firstInserted'] = time.time()
            movie['lastUpdated'] = time.time()
            client.appdb.movies.insert(movie)
        else:
        	continue
            #movie['lastUpdated'] = time.time()
            #client.appdb.movies.replace_one({"link_imdb" : movie['link_imdb']}, movie)
        
def formatMovie(imdbID, fromOmdb, fromRt, fromTmdb):
    result = dict()
    result['title'] = fromTmdb['Title']
    result['plot'] = fromTmdb['Overview'] or fromOmdb['Plot'] or fromRt['Synopsis']
    result['keywords'] = fromTmdb['Keywords']
    result['runtime'] = fromTmdb['Runtime'] or fromRt['Runtime']
    result['budget'] = fromTmdb['Budget']
    result['revenue'] = fromTmdb['Revenue']
    result['tagline'] = fromTmdb['Tagline']
    result['year'] = fromOmdb['Year']
    result['released'] = fromTmdb['Released']
    result['languages'] = fromTmdb['Languages']
    result['country'] = fromOmdb['Country']
    fromTmdb['Studios'].append(None)
    result['studio'] = fromRt['Studio'] or fromTmdb['Studios'][0]  # TODO
    result['cast'] = fromOmdb['Cast'] or fromOmdb['Cast']
    result['directors'] = fromOmdb['Directors'] or fromOmdb['Directors']
    result['homepage'] = fromTmdb['Homepage']
    
    result['awards'] = fromOmdb['Awards']
    result['rating'] = fromRt['Rating'] or fromOmdb['Rating']

    result['score_rtaudience'] = fromRt['RtAudience']
    result['score_rtcritics'] = fromRt['RtCritics']
    result['score_metacritic'] = fromOmdb['Metacritic']
    result['score_imdb'] = fromOmdb['ImdbRating']
    result['votes_imdb'] = fromOmdb['ImdbVotes']
    result['score'] = (fromRt['RtCritics'] or 0) + (fromRt['RtAudience'] or 0) + (fromOmdb['ImdbRating'] or 0)*10

    result['poster'] = fromOmdb['Poster'] or fromTmdb['Poster']
    result['background'] = fromTmdb['Backdrop']

    result['link_rt'] = fromRt['LinkRt']
    result['link_imdb'] = 'tt' + imdbID

    # Genres
    genres = set(fromTmdb['Genres'])
    if 'Kids' in genres:
        genres.remove('Kids')
        genres.add('Family')
    if 'TV Movie' in genres:
        genres.remove('TV Movie')
    result['genres'] = list(genres)

    # Trailer
    trailers = [a for a in fromTmdb['Videos'] if a['type'] == 'Trailer']
    if len(trailers) and trailers[-1]['site'] == 'YouTube':
        result['trailer_youtube'] = trailers[-1]['key']
    else :
        result['trailer_youtube'] = None

    # Search String
    result['search_str'] = (result['title'] + ' ' + ' '.join(result['cast']) + ' '.join(result['directors']) + ' '.join(result['keywords'])).lower()
        
    # Streaming
    result['streaming'] = dict()
    
    return result
    





# We first get the latest data from OMDb
def loadData(hardReset, redownloadOmdb):

    fromOmdb = json.load(open(rawOmdbFile, 'r'))
    
    # OMDB
    print("Downloading the movies from OMDB...")
    if redownloadOmdb:
    	downloadOmdbData()
    print("OMDB movies downloaded and extracted to "+omdbFile+".")
    print("Loading and filtering the movies from OMDB...")
    fromOmdb = loadFromOmdb(omdbFile)
    print(len(fromOmdb), "Movies loaded from OMDB.")
    print("Saving the OMDB filtered movies to "+rawOmdbFile+" ...")
    saveOmdb(fromOmdb, rawOmdbFile)
    print("OMDB movies saved.")

    # Tmdb
    print("Loading TMDB movies, hardReset:"+str(hardReset)+" ...")
    fromTmdb = loadFromTmdb(rawTmdbFile, hardReset, fromOmdb)
    print(len(fromTmdb), " movies loaded from TMDB.")
    print("Saving the TMDB movies to "+rawTmdbFile+" ...")
    saveTmdb(fromTmdb, rawTmdbFile)
    print("TMDB Movies saved.")

    # Rt
    print("Loading Rotten Tomatoes movies, hardReset:"+str(hardReset)+" ...")
    fromRt = loadFromRt(rawRtFile, hardReset, fromOmdb)
    print(len(fromRt), " movies loaded from Rotten Tomatoes.")
    print("Saving the Rotten Tomatoes movies to "+rawRtFile+" ...")
    saveRt(fromRt, rawRtFile)
    print("Rotten Tomatoes movies saved.")
    
    # Netflix
    
    # Amazon

    # Saving and updating the movies
    print("Combining data from OMDB, TMDB, RT...")
    movies = sanitize(fromOmdb, fromTmdb, fromRt)
    print(len(movies)," movies combined.")
    print("Saving movies to "+movieFile+" and "+meteorPath+" ...")
    saveMovies(movies, movieFile, meteorPath)
    print("Movies saved.")
    print("Updating the mongo db with the latest information...")
    updateMovies(movies)
    print("Mongodb updated.")


################# Start of the main programm ##################


if __name__ == "__main__":

	parser = argparse.ArgumentParser(description='Refresh data omdb imdb rotten tomatoes')
	parser.add_argument('--uri', default='mongodb://localhost/appdb',
	                   help='The uri of the mongo connection')
	parser.add_argument('--hardReset', type=int, help='Refresh completely the files', default=0)
	args = parser.parse_args()
	hardReset = args.hardReset
	loadData(hardReset, 1)
