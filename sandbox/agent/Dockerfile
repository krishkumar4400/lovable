FROM node:22-alpine

WORKDIR /home/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3000

RUN mkdir /workspace

CMD [ "npm", "start" ]
