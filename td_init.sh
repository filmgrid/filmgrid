echo "Initialising environment"
sudo kill -9 $(pgrep mongo)
sudo rm /data/db/mongod.lock

cd ~/Projects/Watchlist
sudo mongod --replSet meteor --setParameter textSearchEnabled=true &
subl . &
~/bin/mongo/bin/mongochef.sh &
