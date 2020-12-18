FROM node:12-alpine

COPY package*.json ./
RUN npm install

COPY *.js ./
COPY lists/* ./lists/

ENV COOKIE_SECRET=change_me

RUN npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
