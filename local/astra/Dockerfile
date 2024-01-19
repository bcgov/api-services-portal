FROM python:2-alpine

ENV app /app

RUN mkdir $app
WORKDIR $app

RUN apk update && apk add git

RUN git clone -b dev https://github.com/flipkart-incubator/Astra.git .

COPY . $app

#COPY db.py utils/db.py

#COPY dbconnection.py API/dbconnection.py


RUN pip install -r requirements.txt

WORKDIR API/

#COPY dbconnection.py API/

EXPOSE 8094
ENTRYPOINT ["python", "./api.py"]
CMD ["tail -f /app/logs/scan.log"]
