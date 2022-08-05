#!/bin/bash

wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
cd /etc/apt/sources.list.d
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" >mongodb.list

sudo apt update
yes | sudo apt install mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod
echo "Please wait 10 seconds ..."
sudo sleep 10
