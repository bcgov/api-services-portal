FROM node:alpine

WORKDIR /app

COPY src/package*.json ./
RUN npm install

COPY src/* .

ARG GITHUB_API_TOKEN
ENV COOKIE_SECRET=change_me

RUN npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
