FROM node:22.12.0-alpine3.21

ARG NPM_TOKEN
RUN if [ -n "$NPM_TOKEN" ]; then npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN; fi

WORKDIR /src

COPY package*.json /

EXPOSE 3500

RUN npm install

COPY . /

CMD ["npm", "start"] 
