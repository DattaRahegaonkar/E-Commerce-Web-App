#!/bin/bash

echo "Adding demo data..."
sh demo-data.js

echo "Starting backend server..."
node index.js
