FROM cypress/included:3.2.0

COPY . /e2e

RUN npm install

CMD [ "cy:run" ]

ENTRYPOINT [ "npm", "run" ]

