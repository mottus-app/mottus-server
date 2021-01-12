import * as DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';
import { User } from 'src/users/entity/user.entity';

export const createUserDataLoader = (prisma: PrismaClient) =>
  new DataLoader<string, User>(async (userIds) => {
    console.log('userIds:', userIds);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds as string[] },
      },
    });

    const userIdsToUser: Record<string, User> = {};

    users.forEach((e) => (userIdsToUser[e.id] = e));

    const sortedUsers = userIds.map((id) => userIdsToUser[id]);

    return sortedUsers;
  });
