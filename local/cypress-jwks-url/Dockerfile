FROM node:22.12.0-alpine3.21

WORKDIR /src

COPY package*.json /

EXPOSE 3500

RUN --mount=type=secret,id=npm_token \
  ( [ ! -s /run/secrets/npm_token ] || npm config set //registry.npmjs.org/:_authToken="$(cat /run/secrets/npm_token)" ) && \
  npm install

COPY . /

CMD ["npm", "start"] 
