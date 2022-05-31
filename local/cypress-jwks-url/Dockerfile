FROM node:16.14.2-alpine3.15

WORKDIR /src

COPY package*.json /

EXPOSE 3500

RUN npm install

COPY . /

CMD ["npm", "start"] 
