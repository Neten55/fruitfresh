# Use an official Node.js runtime as a parent image
# We recommend using a specific LTS version, e.g., node:18-alpine or node:20-alpine
# Check your local Node.js version and pick a suitable one.
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if any)
# to install dependencies first. This helps with Docker caching.
COPY package*.json ./

# Install any needed packages
# If your project uses npm:
RUN npm install --production
# If your project uses yarn (uncomment and use this instead):
# RUN yarn install --production

# Copy the rest of the application code
# The dot '.' refers to the current directory on your local machine
# and copies everything into the WORKDIR in the container.
COPY . .

# Expose the port your app will listen on.
# Render automatically injects a PORT environment variable.
# Your application should listen on process.env.PORT (Node.js).
# Render's web services listen on port 10000 internally.
EXPOSE 10000

# Define the command to run your app when the container launches
# Check your package.json's "scripts" section for your start command (e.g., "npm start")
CMD ["npm", "start"]