echo "starting the node server"
cd /Projects/bundle
sudo kill -9 $(pgrep nodejs)
sudo OPLOG_URL="mongodb://127.0.0.1:27017/local" ROOT_URL="http://filmgrid.io/"  MONGO_URL="mongodb://127.0.0.1:27017/appdb" PORT=80 nodejs main.js >/var/tmp/nodejs.log 2>/var/tmp/nodejs.err&
