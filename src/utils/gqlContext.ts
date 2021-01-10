import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

interface Session extends Express.Session {
  userId: string;
}
// here we have a request with the session overrriden by our own session interface
export type CustomRequest = Request & { session: Session };

export interface GqlContext {
  prisma: PrismaClient;
  req: CustomRequest;
  res: Response;
}
