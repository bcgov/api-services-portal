FROM node:12-alpine

COPY backend/package*.json ./
RUN npm install

COPY backend/*.js ./
COPY backend/lists/* ./lists/

ENV COOKIE_SECRET=change_me

RUN npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
