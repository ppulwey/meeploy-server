#!/bin/bash

# Add admin user to mongo db
echo "db.createUser({user: '$1',pwd: '$2',roles: [{ role: 'dbAdminAnyDatabase', db: 'admin' }, { role: 'readWriteAnyDatabase', db: 'admin' }, { role: 'userAdminAnyDatabase', db: 'admin' }]})" | mongo admin

# Overwrite mongo config with auth enabled
sudo cp -fr database/mongod.conf /etc

# Restart mongodb
sudo systemctl restart mongod
