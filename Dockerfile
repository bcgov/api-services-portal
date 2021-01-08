FROM node:12-alpine

COPY package*.json ./
RUN npm install

COPY src ./
COPY public ./public/
COPY *.config.js
COPY tsconfig.json

ARG GITHUB_API_TOKEN

RUN npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
