FROM node:15.14.0-alpine3.13

ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

ARG APP_REVISION
ENV APP_REVISION=${APP_REVISION}

RUN apk add curl jq
RUN npm install -g npm@7.11.2

WORKDIR /app

COPY src/*.json ./
RUN npm install

COPY src ./

ARG GITHUB_API_TOKEN
ENV COOKIE_SECRET=change_me

RUN npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
