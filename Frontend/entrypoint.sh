#!/bin/sh

# Inject BACKEND_URL at runtime into config.js
if [ -n "${BACKEND_URL}" ]; then
  sed -i "s|BACKEND_URL: \"\"|BACKEND_URL: \"${BACKEND_URL}\"|g" \
    /usr/share/nginx/html/config.js
fi

# Inject RAZORPAY_KEY_ID at runtime into config.js
if [ -n "${RAZORPAY_KEY_ID}" ]; then
  sed -i "s|RAZORPAY_KEY_ID: \"\"|RAZORPAY_KEY_ID: \"${RAZORPAY_KEY_ID}\"|g" \
    /usr/share/nginx/html/config.js
fi

exec "$@"
