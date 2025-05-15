# Dockerfile for React App

# Use an official Node.js runtime as a parent image
FROM node:16-alpine

WORKDIR /usr/src/app

#Copy the package.json and package-lock.json files
COPY package*.json ./
COPY vite.config.js ./

# Install dependencies
RUN npm install --legacy-peer-deps


# Accept BUILD_ENV as a build argument (no default!)
ARG BUILD_ENV

#will always keep this as production to maintain production like node env even when pushing to test environment
ENV NODE_ENV=production

# Copy env files and set appropriate one
COPY .env.* ./
RUN if [ ! -f .env.${BUILD_ENV} ]; then echo ".env.${BUILD_ENV} not found!" && exit 1; fi && cp .env.${BUILD_ENV} .env


# Copy all source code
COPY . .

# build the app with correct environment depending on whether production or test
RUN npm run build -- --mode $BUILD_ENV


# Install static file server 
RUN npm install -g serve

# Expose port 5173 (used by both serve and Vite if configured correctly)
EXPOSE 5173

# Copy the appropriate CMD script based on BUILD_ENV
COPY CMD-${BUILD_ENV}.sh /usr/src/app/CMD.sh

# Ensure it is executable
RUN chmod +x /usr/src/app/CMD.sh

# Set the entrypoint ie starting appropriate server based on BUILD_ENV , npm run dev for test and serve -s dist for prod
CMD ["/usr/src/app/CMD.sh"]





