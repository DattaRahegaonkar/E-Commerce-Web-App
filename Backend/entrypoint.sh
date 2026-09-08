#!/bin/sh

DATA_EXISTS=$(node check-data.js)

if [ "$DATA_EXISTS" = "yes" ]; then
  echo "Demo data already exists, skipping seeding."
else
  echo "Seeding demo data..."
  node demo-data.js
fi

echo "Starting backend server..."
node index.js
