FROM node:23-alpine3.19

RUN apk add build-base

RUN apk add gcc musl-dev

ARG PORT

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "start"]