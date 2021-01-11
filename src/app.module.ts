import {
  Injectable,
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  NestModule,
} from '@nestjs/common';
import * as session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { prisma } from './utils/setPrisma';
import { __isProd__ } from './utils/isProd';
import { COOKIE_NAME } from './utils/cookieName';
@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src', 'schema.graphql'),
      // so we can use our own cors
      cors: false,
      context: ({ req, res }) => ({ req, res, prisma }),
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          name: COOKIE_NAME,
          cookie: {
            //is the time the cookie will expire
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: __isProd__,
            httpOnly: true,
            sameSite: 'lax',
          },
          secret: process.env.SESSION_SECRET || 'session-secret',
          resave: false,
          saveUninitialized: false,
          //make sure to have a session model in the prisma schema
          store: new PrismaSessionStore(prisma, {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
          }),
        }),
      )
      .forRoutes('*');
  }
}
