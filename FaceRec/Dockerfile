FROM node:14

WORKDIR /usr/src/FaceRec

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "FaceRec.js"]