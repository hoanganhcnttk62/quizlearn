FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 4000

ENV PORT=4000

# Start the application
CMD ["npm", "run", "dev"]