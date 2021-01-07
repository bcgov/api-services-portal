FROM node:alpine

COPY package*.json ./
RUN npm install

COPY *.js ./
COPY lists/* ./lists/
COPY pages/* ./pages/
COPY components/* ./components/

ENV COOKIE_SECRET=change_me

RUN npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
