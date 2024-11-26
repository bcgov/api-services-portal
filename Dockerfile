FROM node:20-alpine3.19

ARG APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=${APP_VERSION}

ARG APP_REVISION
ENV NEXT_PUBLIC_APP_REVISION=${APP_REVISION}

RUN apk add curl jq

WORKDIR /app

# Workaround due to an ESM error
COPY src/keycloak-admin-client ./keycloak-admin-client

COPY src/*.json ./
RUN npm install --legacy-peer-deps

COPY src ./

ARG GITHUB_API_TOKEN
ENV COOKIE_SECRET=change_me

RUN npm run build

# Create the /.npm directory and grant access to group 0 to allow npm v9 to work
# See: https://docs.openshift.com/container-platform/4.11/openshift_images/create-images.html#use-uid_create-images
RUN mkdir /.npm
RUN chgrp -R 0 /.npm && \
    chmod -R g=u /.npm

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
