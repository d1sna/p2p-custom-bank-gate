<p align="center">
<a href="http://m-apps.ru" target="_blank"><img src="/public/index.png" alt="NPM Version" /></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

P2P BANK GATE ON NEST JS

## Installation

# Docker installation

Create local app image

```bash
$ docker build -t  p2p_gate:latest .
```

Create app container

1. Change environment variables

   PORT - app start port
   HOST - your url for getting access to app
   RECEIVER_CARD - card number to receive money

2. Start docker container

```bash
$ cd APPLICATION_FOLDER
$ docker-compose up -d
```

Open browser and get url from env HOST.

# Install app local

1. Setup env

```bash
$ cd APPLICATION_FOLDER

# set env
$ nano .env # setup env
```

PORT - app start port
HOST - your url for getting access to app
RECEIVER_CARD - card number to receive money

2. Run app

```bash
# build
$ npm run build

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
