FROM node:22.12.0-alpine3.21

WORKDIR /src

COPY package*.json /

EXPOSE 4242

RUN npm install

COPY . /

CMD ["npm", "start"] 