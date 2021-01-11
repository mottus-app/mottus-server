/* istanbul ignore file */

import { PrismaClient } from '@prisma/client';
import { __isProd__ } from './isProd';

// export const prisma = new PrismaClient({
//   // to log only the queries when in development
//   log: __isProd__ ? [] : ['query'],
// });
export const prisma = new PrismaClient();
