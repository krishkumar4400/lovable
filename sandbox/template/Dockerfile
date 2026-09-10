FROM node:22-alpine

WORKDIR /wordspace

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5173

CMD [ "npm", "run", "dev" ]
