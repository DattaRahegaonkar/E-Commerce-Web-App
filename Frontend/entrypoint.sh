#!/bin/sh

# Replace the empty BACKEND_URL value in config.js with the actual backend URL
# In Docker, BACKEND_URL env var is set (e.g. http://backend-container:8081)
# Locally, config.js stays as "" and Vite proxy handles routing
if [ -n "${BACKEND_URL}" ]; then
  sed -i "s|BACKEND_URL: \"\"|BACKEND_URL: \"${BACKEND_URL}\"|g" \
    /usr/share/nginx/html/config.js
fi

exec "$@"
