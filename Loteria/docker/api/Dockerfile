FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install \
    && npm rebuild argon2 --build-from-source

COPY . .

EXPOSE 3333

CMD ["npm", "run", "dev"]
