# ----------------- Builder Stage -----------------

# Base Node image
FROM node:18-slim AS builder

# Set working dir
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# ----------------- Production Stage -----------------

# node base image
FROM node:18-slim AS production

# Set working dir
WORKDIR /app

# Copy only the necessary files from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy entrypoint script
COPY entrypoint.sh ./

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Copy the all source files
COPY . .

# Create a non-root user to run the application
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Change ownership of the application files
RUN chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

# Expose the application port
EXPOSE 8081

# Start the application
CMD ["./entrypoint.sh"]