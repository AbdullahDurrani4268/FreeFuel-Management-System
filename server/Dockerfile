# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Set environment variables (directly with ENV instead of ARG)
ENV MONGO_URI=mongodb://mongo:27017/freefuel
ENV JWT_SECRET=freefuel_secret
ENV PORT=5000

# Expose the port your app will run on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
