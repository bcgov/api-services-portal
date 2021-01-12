FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN git clone https://github.com/bcgov/react-shared-components.git \
 && (cd react-shared-components && npm install && npm run build)
# RUN npm install https://github.com/bcgov/react-shared-components/releases/download/1.1.0/shared-components-1.1.0.tgz &&
#     (cd node_modules/shared-components && npm install && npm run build)

COPY *.js ./
COPY app ./app
COPY components ./components
COPY lists ./lists
COPY pages ./pages
COPY public ./public

ARG GITHUB_API_TOKEN
ENV COOKIE_SECRET=change_me

RUN npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start"]
