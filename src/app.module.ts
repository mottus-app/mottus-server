import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import * as session from 'express-session';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationModule } from './organization/organization.module';
import { UsersModule } from './users/users.module';
import { COOKIE_NAME } from './utils/cookieName';
import { createUserDataLoader } from './utils/createUserDataLoader';
import { __isProd__ } from './utils/isProd';
import { prisma } from './utils/setPrisma';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src', 'schema.graphql'),
      // so we can use our own cors
      cors: false,
      context: ({ req, res }) => ({
        req,
        res,
        prisma,
        userLoader: createUserDataLoader(prisma),
      }),
      formatError: (err) => {
        // console.log('err:', err);
        // return
        // const res = err.extensions?.exception?.response;
        // const isAuthError = res?.statusCode === 401 || res?.statusCode === 403;
        // // console.log('isAuthError:', isAuthError);
        // if (isAuthError) {
        //   return {
        //     field: 'auth',
        //     message: 'you are not authorized',
        //   };
        // }
        // const field:
        // console.log('err:', err);
        // return err.extensions?.exception?.response;
        return err;
      },
    }),
    UsersModule,
    OrganizationModule,
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
            // checkPeriod: 2 * 1000 * 60,
            dbRecordIdIsSessionId: true,
            // checkPeriod: 2 * 1000 * 60 * 60, //ms
            // dbRecordIdIsSessionId: true,
            // dbRecordIdFunction: undefined,
          }),
        }),
      )
      .forRoutes('*');
  }
}
