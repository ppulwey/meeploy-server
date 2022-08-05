#!/bin/bash

# Add admin user to mongo db
echo "db.createUser({user: '$2',pwd: '$3',roles: [{ role: 'dbAdminAnyDatabase', db: 'admin' }, { role: 'readWriteAnyDatabase', db: 'admin' }, { role: 'userAdminAnyDatabase', db: 'admin' }]})" | mongosh admin

# Overwrite mongo config with auth enabled
sudo cp -fr $1 /etc

# Restart mongodb
sudo systemctl restart mongod
