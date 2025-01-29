# Base image
FROM node:18-alpine

# Create working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Set port
EXPOSE 3000

# Start application
CMD ["npm", "start"]