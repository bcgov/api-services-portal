FROM node:alpine AS BUILD

COPY package*.json /app/

WORKDIR /app

RUN npm install

COPY *.js ./

ENTRYPOINT ["node", "index.js"]