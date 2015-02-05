sudo apt-get update
curl https://install.meteor.com/ | sh
sudo apt-get install python-software-properties
sudo apt-add-repository ppa:chris-lea/node.js
sudo apt-get install nodejs
sudo apt-get install mongodb

echo "Initialising mongo"
sudo kill -9 $(pgrep mongo)
sudo rm /data/db/mongod.lock
sudo mongod --dbpath /data/db --port 8000 --replSet meteor --setParameter textSearchEnabled=true --logpath /var/tmp/mongodb&
echo 'var config = {_id: "meteor", members: [{_id: 0, host: "127.0.0.1:8000"}]}; rs.initiate(config);' > config.js
mongo localhost:8000 config.js

export OPLOG_URL=mongodb://104.155.6.39:80/local
export ROOT_URL="http://http://104.155.5.219/" 
export MONGO_URL="mongodb://10.240.161.48:80/appdb"
sudo nodejs main.js&