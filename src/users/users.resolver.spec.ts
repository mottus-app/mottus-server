import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { createMock } from '@golevelup/ts-jest';
import { UsersService } from './users.service';
import { GqlContext, CustomRequest } from 'src/utils/gqlContext';
import { COOKIE_NAME } from 'src/utils/cookieName';
import { User } from 'src/users/entity/user.entity';

let resolver: UsersResolver;
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [UsersResolver, UsersService],
  }).compile();

  resolver = module.get<UsersResolver>(UsersResolver);
});
describe('UsersResolver', () => {
  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('Get User', () => {
    const context = createMock<GqlContext>({
      res: {
        clearCookie: jest.fn(),
      },
      prisma: {
        user: {
          findUnique: () => null,
        },
      },
      req: {
        session: {
          userId: null,
        },
      },
    });
    describe('null states', () => {
      it('sends null with no userId', async () => {
        const callResolver = await resolver.me(context);
        expect(callResolver.user).toBeNull();
      });

      it('sends null if no user found', async () => {
        const ctx = createMock<GqlContext>({
          res: {
            clearCookie: jest.fn(),
          },
          req: {
            session: {
              userId: '123' as any,
            },
          },
          prisma: {
            user: {
              findUnique: jest.fn().mockResolvedValue(null),
            },
          },
        });
        const callResolver = await resolver.me(ctx as any);
        expect(ctx.prisma.user.findUnique).toHaveBeenCalled();
        expect(ctx.res.clearCookie).toHaveBeenCalled();
        expect(ctx.res.clearCookie).toHaveBeenCalledWith(COOKIE_NAME);
        expect(callResolver.user).toBeNull();
      });

      it('when error', async () => {
        const ctx = createMock<GqlContext>({
          res: {
            clearCookie: jest.fn(),
          },
          req: {
            session: {
              userId: '123' as any,
            },
          },

          prisma: {
            user: {
              findUnique: jest.fn().mockRejectedValue(new Error('Error')),
            },
          },
        });
        const callResolver = await resolver.me(ctx);
        expect(callResolver.user).not.toBeDefined();
        expect(callResolver).toStrictEqual({
          errors: [
            {
              field: 'internal server error',
              message: 'please try again later',
            },
          ],
        });
        expect(callResolver.errors).toStrictEqual([
          {
            field: 'internal server error',
            message: 'please try again later',
          },
        ]);
        // expect(context.prisma.user.findUnique).toHaveBeenCalled();
        // expect(context.res.clearCookie).toHaveBeenCalled();
        // expect(context.res.clearCookie).toHaveBeenCalledWith(COOKIE_NAME);
        // expect(callResolver.user).toBeNull();
      });
    });

    describe('works', () => {
      it('sends back a user', async () => {
        const mockedUser: User = {
          createdAt: new Date(),
          email: 'andre@gmail.com',
          id: '123',
          name: 'andre',
          password: 'password',
          profilePic: '',
          role: 'USER',
          updatedAt: new Date(),
        };
        const ctx = createMock<GqlContext>({
          res: {
            clearCookie: jest.fn(),
          },
          req: {
            session: {
              userId: '123' as any,
            },
          },
          prisma: {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockedUser),
            },
          },
        });
        const calledResolver = await resolver.me(ctx);
        expect(calledResolver.user).toBeDefined();
        expect(calledResolver.user.email).toBe(mockedUser.email);
      });
    });
  });
});
