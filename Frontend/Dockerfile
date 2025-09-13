# ------------ Dependency Stage -------------

# Use a lightweight Node.js image for installing dependencies
FROM node:18-alpine AS dependency

# Set the working directory inside the container
WORKDIR /app

# Copy only package files to install dependencies
COPY package*.json ./

# Install npm dependencies
RUN npm install --no-audit


# ------------ Runtime Stage -------------

# Use another lightweight Node.js image for the build process
FROM node:18-alpine AS builder

WORKDIR /app

# Copy installed dependencies
COPY --from=dependency /app/node_modules ./node_modules

# Copy the rest of the application code
COPY . .

# Build the app using Vite (outputs to /app/dist)
RUN npm run build


# ------------ Deploy Stage -------------

# Use a lightweight Nginx image to serve the built app
FROM nginx:alpine AS runtime

# Copy the built app from the builder stage to Nginx's default HTML directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration file
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]