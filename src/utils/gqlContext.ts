import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createUserDataLoader } from './createUserDataLoader';

// export type MySession = Session & Partial<SessionData> & { userId: string };
// import { Request, Response } from "express";
// import { Session, SessionData } from "express-session";
// import { Redis } from "ioredis";

// export type MyContext = {
//   req: Request & {
//     session: Session & Partial<SessionData> & { UserID: number };
//   };
//   redis: Redis;
//   res: Response;
// };
export interface MySession extends Express.Session {
  userId?: string;
  // [key?: string]: any;
}
// here we have a request with the session overrriden by our own session interface
export interface CustomRequest extends Request {
  session?: MySession;
  // session: Session & Partial<SessionData> & { userId: string };
}

export interface GqlContext {
  prisma: PrismaClient;
  req: CustomRequest;
  res: Response;
  userLoader: ReturnType<typeof createUserDataLoader>;
}
