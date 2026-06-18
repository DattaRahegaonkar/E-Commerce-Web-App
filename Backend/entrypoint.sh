#!/bin/bash

echo "Adding demo data..."
node demo-data.js

echo "Starting backend server..."
node index.js
