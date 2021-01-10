/* istanbul ignore file */
import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { AppModule } from './app.module';
import { sessionConfig } from './utils/sessionConfig';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.ORIGIN || 'http://localhost:3000'],
    credentials: true,
  });

  sessionConfig(app);
  await app.listen(3005);
}
bootstrap();
