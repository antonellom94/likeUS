FROM node:14-slim

ARG QUEUE_ARG

ENV QUEUE=${QUEUE_ARG}

WORKDIR /usr/src/FaceRec

COPY package*.json ./

RUN apt-get update && \ 
    apt-get install -y build-essential \
    wget \
    python3 \
    make \
    gcc \ 
    libc6-dev \
    -y fontconfig-config

RUN npm install

COPY . .

EXPOSE 3001

CMD node FaceRec.js ${QUEUE}