FROM node:lts-alpine3.17

RUN apk add curl jq

ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

ARG APP_REVISION
ENV APP_REVISION=${APP_REVISION}

USER node
WORKDIR /app

COPY --chown=node package*.json ./
RUN npm install

COPY --chown=node . ./

ENV HOME=/home/node

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
