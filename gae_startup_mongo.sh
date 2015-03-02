echo "Initialising environment"
sudo kill -9 $(pgrep mongo)
sudo rm /data/db/mongod.lock
sudo mongod --auth --dbpath /data/db --port 8000 --replSet meteor --logpath /var/tmp/mongodb&

echo "Waiting for mongo to start"
sleep 10
echo 'var config = {_id: "meteor", members: [{_id: 0, host: "127.0.0.1:8000"}]}; rs.initiate(config);' > config.js
mongo localhost:8000 -u tdelteil -p tdelteil --authenticationDatabase admin config.js

echo "Creating the index for movies..."
index='
db = db.getSiblingDB("appdb");
db.movies.dropIndex("movies");
db.movies.ensureIndex(
    { title : "text",
     actors : "text" ,
     directors : "text" 
    },
    { 
    	default_language: "none",
      name: "movies",
      weights: {
     		title : 2,
     		actors : 1,
     		directors : 1
    	}
   }
);'
echo $index > index.js
mongo localhost:8000 -u tdelteil -p tdelteil --authenticationDatabase admin index.js