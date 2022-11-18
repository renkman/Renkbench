FROM node:14.21-bullseye

WORKDIR /src

COPY ./public ./public
COPY ./spec ./spec
COPY ./package.json ./

RUN npm install

ENTRYPOINT [ "npm", "test" ]
