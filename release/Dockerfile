ARG VERSION=latest
FROM renkman/renkbench:${VERSION}

ARG releasenumber=1

WORKDIR /usr/src/app

# Set release number
RUN sed -i "s/\\$\\$\_RELEASE\_NUMBER_\\$\\$/${releasenumber}/g" public/workbench.js

EXPOSE 8080
CMD [ "npm", "start" ]