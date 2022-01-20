FROM node:15.14.0-alpine3.13

WORKDIR /src

COPY package*.json /

EXPOSE 3500

RUN npm install

COPY . /

CMD ["npm", "start"]