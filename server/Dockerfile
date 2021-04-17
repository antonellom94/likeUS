FROM node:14

WORKDIR /server

COPY package*.json /server

RUN npm install

COPY . /server

CMD ["npm", "start"]