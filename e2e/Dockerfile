# Dockerfile
# Use Cypress's base image to help set up the environment/dependencies
FROM cypress/base:12.4.0

# This helps to clean up the console output
ENV CI=1 

# Proceed with installing Node dependencies
RUN mkdir -p /opt/frontendapp/
WORKDIR /opt/frontendapp/

COPY package.json /opt/frontendapp/
COPY package-lock.json /opt/frontendapp/

RUN npm ci

# Copy over application code and installed node_modules
COPY . /opt/frontendapp
WORKDIR /opt/frontendapp

# Verify Cypress installation worked
RUN ./node_modules/.bin/cypress verify


ENTRYPOINT ["npm", "run", "cy:run:html"]