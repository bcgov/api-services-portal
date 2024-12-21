FROM cypress/included:12.17.4

# Copy of the source for code coverage analysis
WORKDIR /app
COPY src/. ./

RUN npm install --legacy-peer-deps

RUN npx nyc instrument --compact=false . --in-place

# Cypress E2E
WORKDIR /e2e

RUN apt-get -y update; apt-get -y install curl
COPY e2e/package.json /e2e
COPY e2e/package-lock.json /e2e
RUN npm install

COPY e2e/cypress.config.ts /e2e
COPY e2e/tsconfig.json /e2e
COPY e2e/*.yml /e2e
COPY e2e/entrypoint.sh /tmp
ADD e2e/cypress /e2e/cypress

RUN curl -v -L -O https://github.com/bcgov/gwa-cli/releases/download/v3.0.5/gwa_Linux_x86_64.tgz \
 && tar -xzf gwa_Linux_x86_64.tgz \
 && mv gwa /usr/local/bin/.

ENTRYPOINT ["npm", "run", "cy:run:html"]