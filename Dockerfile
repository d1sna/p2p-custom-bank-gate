FROM node:12.20.0
EXPOSE 7000

# Восстанавливаем пакеты
RUN echo "$PWD"

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN echo "$PWD"
WORKDIR /app
RUN echo "$PWD"
RUN npm ci --only-production

WORKDIR /app/nest-core
RUN echo "$PWD"
RUN npm ci --only-production

# WORKDIR //
# Копируем всё остальное
COPY . /app
RUN echo "$PWD"
RUN	ls -lh /app

WORKDIR /app
RUN npm run build

WORKDIR /app
ENTRYPOINT [ "npm", "start" ]