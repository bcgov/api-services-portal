FROM node:17.7.2-alpine3.15

ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

ARG APP_REVISION
ENV APP_REVISION=${APP_REVISION}

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
