FROM cypress/included:12.17.4

WORKDIR /e2e

RUN apt-get -y update; apt-get -y install curl
COPY package.json /e2e
COPY package-lock.json /e2e
RUN npm install

COPY cypress.config.ts /e2e
COPY tsconfig.json /e2e
COPY *.yml /e2e
COPY entrypoint.sh /tmp
ADD cypress /e2e/cypress

RUN curl -v -L -O https://github.com/bcgov/gwa-cli/releases/download/v2.0.15/gwa_Linux_arm64.tgz \
 && tar -xzf gwa_Linux_arm64.tgz \
 && mv gwa /usr/local/bin/.



ENTRYPOINT ["npm", "run", "cy:run:html"]