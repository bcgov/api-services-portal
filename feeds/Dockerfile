FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
