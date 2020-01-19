FROM node
ARG buildNumber=1
ARG releaseNumber=1

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
# TODO: Replace $$_BUILD_NUMBER_$$ and $$_RELEASE_NUMBER_$$ in workbench.js with buildNumber and releaseNumber

RUN npm test

EXPOSE 8080
CMD [ "npm", "start" ]