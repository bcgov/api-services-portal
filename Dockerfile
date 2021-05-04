FROM node:15.14.0-alpine3.13

WORKDIR /app

COPY src/*.json ./
RUN npm install

COPY src ./

ARG GITHUB_API_TOKEN
ENV COOKIE_SECRET=change_me

RUN npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
