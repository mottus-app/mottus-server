/* istanbul ignore file */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.ORIGIN || 'http://localhost:3000'],
    credentials: true,
  });

  await app.listen(3005);
}
bootstrap();
