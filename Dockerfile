#FROM node:lts-alpine3.17
FROM node:16.14.2-alpine3.15

ARG APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=${APP_VERSION}

ARG APP_REVISION
ENV NEXT_PUBLIC_APP_REVISION=${APP_REVISION}

RUN apk add curl jq

USER node
WORKDIR /app

COPY --chown=node src/*.json ./
RUN npm install --legacy-peer-deps

COPY --chown=node src ./

ARG GITHUB_API_TOKEN
ENV COOKIE_SECRET=change_me

RUN npm run build

ENV HOME=/home/node

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
