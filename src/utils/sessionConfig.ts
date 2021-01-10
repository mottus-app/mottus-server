/* istanbul ignore file */

import * as session from 'express-session';

import { INestApplication } from '@nestjs/common';
import { COOKIE_NAME } from './cookieName';
import { __isProd__ } from './isProd';
import { prisma } from './setPrisma';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

export function sessionConfig(app: INestApplication) {
  app.use(
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
  );
}
