FROM node:lts-alpine3.17

ARG APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=${APP_VERSION}

ARG APP_REVISION
ENV NEXT_PUBLIC_APP_REVISION=${APP_REVISION}

RUN apk add curl jq
RUN npm install -g npm

WORKDIR /app

COPY src/*.json ./
RUN npm install --legacy-peer-deps

COPY src ./

ARG GITHUB_API_TOKEN
ENV COOKIE_SECRET=change_me

RUN NODE_OPTIONS=--openssl-legacy-provider npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
