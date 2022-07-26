import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
const exportEnvToHtml = require('../src/lib/exportEnvToHtml');

async function start() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  const PORT = process.env.PORT || 7000;
  if (!process.env.HOST) process.env.HOST = `http://localhost:${PORT}`;
  exportEnvToHtml();

  await app.listen(PORT);
  console.log(`> APP STARTED AT PORT ${PORT}`);
}
start();
