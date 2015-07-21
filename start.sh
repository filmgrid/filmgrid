echo "Updating..."
sudo apt-get update

echo "Installing git"
sudo apt-get --yes --force-yes install git

echo "Creating folders"
sudo mkdir -p /data/db
sudo mkdir -p /Projects

echo "Installing mongo"
sudo echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
sudo apt-get --yes --force-yes update
sudo apt-get --yes --force-yes install mongodb-org=2.6.0 mongodb-org-server=2.6.0 mongodb-org-shell=2.6.0 mongodb-org-mongos=2.6.0 mongodb-org-tools=2.6.0

echo "Installing nodejs"
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get --yes --force-yes install nodejs

echo "Installing meteorJS"
curl https://install.meteor.com/ | sudo sh

echo "Getting the app"
cd /Projects; sudo git clone --depth 1 https://ThomasDelteil:FAB88t91m97@github.com/plegner/Filmgrid.git filmgrid
cd /Projects/filmgrid/meteorApp
sudo meteor build ../../
cd /Projects
sudo tar -xzf meteorApp.tar.gz
cd /Projects/bundle/programs/server
sudo npm install

bash start_mongo.sh
bash start_node.sh
