echo "starting mongodb"
sudo kill -9 $(pgrep mongo)
sudo rm /data/db/mongod.lock
sudo mongod --dbpath /data/db --port 27017 --logpath /var/tmp/mongod&

echo "wait for mongo to start"
sleep 5
sudo mongo /Projects/filmgrid/index.js
