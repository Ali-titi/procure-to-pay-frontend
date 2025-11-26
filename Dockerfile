# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 80

# Install serve to serve the built application
RUN npm install -g serve

# Start the application
CMD ["serve", "-s", "dist", "-l", "80"]