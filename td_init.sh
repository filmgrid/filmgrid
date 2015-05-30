echo "I am Initialising environment"
sudo kill -9 $(pgrep mongo)
sudo rm /data/db/mongod.lock

cd ~/Projects/Filmgrid
sudo mongod --replSet meteor &
