FROM node
ARG buildnumber=1

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Set the build number
RUN sed -i "s/\\$\\$\__BUILD_NUMBER_\_\\$\\$/${buildnumber}/g" workbench.js

RUN npm test

EXPOSE 8080
CMD [ "npm", "start" ]