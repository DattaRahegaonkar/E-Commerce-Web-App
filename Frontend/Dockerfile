# ------------ Stage 1: Build the React/Vite app ------------

# Use a lightweight Node.js image for building the app
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only package files to install dependencies
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy all source files into the container
COPY . .

# Build the app using Vite (outputs to /app/dist)
RUN npm run build


# ------------ Stage 2: Create a lightweight image for serving ------------

# Use the same base image again (clean and lightweight)
FROM node:18-alpine

# Set working directory for the runtime container
WORKDIR /app

# Copy the built output (`dist`) from the first stage
COPY --from=builder /app/dist ./dist

# Install `serve`, a static file server to host the frontend
RUN npm install -g serve

# Expose port 5000 to allow container to serve the app
EXPOSE 5000

# Run the `serve` command to serve files from the `dist` folder
CMD ["serve", "-s", "dist", "-l", "5000"]
