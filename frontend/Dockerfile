FROM node:24-bullseye-slim

WORKDIR /app

COPY package.json ./
RUN corepack enable && yarn install

COPY . .

EXPOSE 5173

CMD ["yarn", "dev", "--host"]
