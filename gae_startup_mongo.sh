sudo apt-get update
sudo apt-get install mongodb
echo "Initialising environment"
sudo kill -9 $(pgrep mongo)
sudo rm /data/db/mongod.lock
sudo mongod --dbpath /data/db --port 8000 --replSet meteor --setParameter textSearchEnabled=true --logpath /var/tmp/mongodb&
echo 'var config = {_id: "meteor", members: [{_id: 0, host: "127.0.0.1:8000"}]}; rs.initiate(config);' > config.js
mongo localhost:8000 config.js