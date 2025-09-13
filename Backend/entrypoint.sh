#!/bin/bash

echo "Adding the demo data into database"
node demo-data.js

echo "Starting backend..."
node index.js
