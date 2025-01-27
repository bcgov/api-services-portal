#FROM node:lts-alpine3.17
FROM node:22.12.0-alpine3.21

RUN apk add curl jq

ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

ARG APP_REVISION
ENV APP_REVISION=${APP_REVISION}

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

# Create the /.npm directory and grant access to group 0 to allow npm v9 to work
# See: https://docs.openshift.com/container-platform/4.11/openshift_images/create-images.html#use-uid_create-images
RUN mkdir /.npm
RUN chgrp -R 0 /.npm && \
    chmod -R g=u /.npm

CMD [ "node", "index.js" ]
