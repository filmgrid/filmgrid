# Filmgrid.io


## TODO List

### Data
* ![](https://tr.im/RtH0v) Update data (Keywords, Plot, Search String, Rating), only publish what's needed
* ![](https://tr.im/RtH0v) Get better Netflix, Amazon Prime and Hulu ids
* ![](https://tr.im/RtH0v) Get more movies, and update job to get recent movies
* ![](https://tr.im/PtXLf) CMS to update Movie details
* ![](https://tr.im/3GIP7) Improved data flow (no duplication in db)

### Recommendations
* ![](https://tr.im/RtH0v) Ratings bonus for very recent movies
* ![](https://tr.im/RtH0v) Update recommendations on initial load
* ![](https://tr.im/3GIP7) Improve recommendations by similar movies
* ![](https://tr.im/3GIP7) Compute recommendations by similar users
* ![](https://tr.im/3GIP7) Compute recommendations by Facebook friends

### Bug Fixes
* ![](https://tr.im/RtH0v) Active movie on initial load (global session variables)
* ![](https://tr.im/RtH0v) Search Icon
* ![](https://tr.im/RtH0v) Movie trailer fullscreen
* ![](https://tr.im/RtH0v) Loading icon / load more button
* ![](https://tr.im/RtH0v) No scroll events when at bottom of page
* ![](https://tr.im/PtXLf) When opening movies, scroll into view
* ![](https://tr.im/PtXLf) Search Autocomplete
* ![](https://tr.im/PtXLf) Improve global search (throttle)
* ![](https://tr.im/3GIP7) Better transitions between grid + other pages
* ![](https://tr.im/3GIP7) More intuitive action icons (stars, dismiss, etc.)
* ![](https://tr.im/3GIP7) Load movie details in separate request when opening popup

### New Features
* ![](https://tr.im/RtH0v) Amazon Referral Buttons
* ![](https://tr.im/PtXLf) Timeline / coming soon view
* ![](https://tr.im/3GIP7) Open Source Grid
* ![](https://tr.im/3GIP7) Recommend movies to friends
* ![](https://tr.im/3GIP7) Group movie series (Harry Potter, ...) into one item
* ![](https://tr.im/3GIP7) Watch with friends page
* ![](https://tr.im/3GIP7) Auto-tag user's liked movies from Facebook
* ![](https://tr.im/3GIP7) Undo last action
* ![](https://tr.im/3GIP7) More filter options in sidebar (language, rating, revenue, ...)

### Performance & Infrastructure
* ![](https://tr.im/RtH0v) Hosting + Uptime/balancing issues
* ![](https://tr.im/RtH0v) Basic iOS Support
* ![](https://tr.im/PtXLf) Fully Mobile + Touch Version
* ![](https://tr.im/PtXLf) Rollbacks and backups
* ![](https://tr.im/3GIP7) Kill Meteor
* ![](https://tr.im/3GIP7) Native Movie Apps

### Publicity
* ![](https://tr.im/PtXLf) Facebook, Twitter, Google+, Tumbler Pages
* ![](https://tr.im/PtXLf) Advertising (Hackernews, ...)


<!--
TAGS:
* https://tr.im/RtH0v  -  beta
* https://tr.im/PtXLf  -  1.0
* https://tr.im/3GIP7  -  future
-->


## Data Sources

* http://developer.rottentomatoes.com/docs
* http://www.omdbapi.com/
* http://www.canistream.it/
* https://github.com/bulv1ne/CanIStreamIt/blob/master/canistreamit/canistreamit.py
* http://www.imdb.com/interfaces
* http://developer.rottentomatoes.com/docs/read/json/v10/Movie_Info
* http://www.allflicks.net/ (Netflix)


## Competition

* https://www.popcha.tv/popchax/en/
* http://www.traileraddict.com/
* http://movieo.me/?grid=grid_movie&file=movies%2F_movies&rate_by=imdb_top&years%5B%5D=1926&years%5B%5D=2015
* https://news.ycombinator.com/item?id=8547351


## Machine Learning Libraries

* http://muricoca.github.io/crab/tutorial.html
* http://scikit-learn.org/stable/auto_examples/cluster/plot_kmeans_digits.html

