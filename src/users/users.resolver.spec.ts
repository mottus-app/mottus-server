import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { createMock } from '@golevelup/ts-jest';
import { UsersService } from './users.service';
import { GqlContext } from 'src/utils/gqlContext';
import { COOKIE_NAME } from 'src/utils/cookieName';
import { User } from 'src/users/entity/user.entity';
import { SignupDto } from './dto/signup.dto';
import { genSalt, hash } from 'bcryptjs';
import { LogInDto } from './dto/login.dto';

// we pass the User resolver for testing
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
    describe('null states', () => {
      it('sends null with no userId', async () => {
        const context = createMock<GqlContext>({
          req: {
            session: {
              userId: null,
            },
          },
        });
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

  describe('Signup', () => {
    describe('error states', () => {
      describe('input validation', () => {
        // we use this so we can do proper unit testing for each resolver
        const mockContext = createMock<GqlContext>();
        const obj = {
          email: '123',
          name: '123',
          password: '123',
        };
        it('name fails', async () => {
          //here we call the resolver it self
          const callResolver = await resolver.signup(obj, mockContext);
          expect(callResolver.user).toBeUndefined();
          expect(callResolver.errors).toBeDefined();
          expect(callResolver.errors.length).toBeGreaterThan(1);
          const isUsernameError = callResolver.errors.find(
            (el) => el.field === 'name',
          );
          expect(isUsernameError).toBeDefined();
          const callResolverWithArr = await resolver.signup(
            {
              // @ts-expect-error
              name: [],
            },
            mockContext,
          );
          const stillUsername = callResolverWithArr.errors.find(
            (el) => el.field === 'name',
          );
          expect(stillUsername).toBeDefined();
        });
        it('username works', async () => {
          const callResolver = await resolver.signup(
            {
              ...obj,
              name:
                'Alonso mario garcia minuar suarez de la conna madre que te pario',
            },
            mockContext,
          );

          const notUsername = callResolver.errors.find(
            (e) => e.field === 'name',
          );
          expect(notUsername).not.toBeDefined();
        });

        it('email fails', async () => {
          const callResolver = await resolver.signup(obj, mockContext);
          expect(callResolver.user).toBeUndefined();
          expect(callResolver.errors).toBeDefined();
          expect(callResolver.errors.length).toBeGreaterThan(1);
          const isEmailError = callResolver.errors.find(
            (el) => el.field === 'email',
          );
          expect(isEmailError).toBeDefined();
          const callResolverWithArr = await resolver.signup(
            {
              // @ts-expect-error
              email: [],
            },
            mockContext,
          );
          const stillEmail = callResolverWithArr.errors.find(
            (el) => el.field === 'email',
          );
          expect(stillEmail).toBeDefined();
          const anotherResolver = await resolver.signup(
            // @ts-expect-error
            {
              email: 'yomoma@com',
            },
            mockContext,
          );
          expect(
            anotherResolver.errors.find((e) => e.field === 'email'),
          ).toBeDefined();
        });

        it('email works', async () => {
          const callResolver = await resolver.signup(
            {
              ...obj,
              email: 'yomoma@gmail.com',
            },
            mockContext,
          );

          const isEmail = callResolver.errors.find(
            (el) => el.field === 'email',
          );
          expect(isEmail).not.toBeDefined();
        });

        it('password fails', async () => {
          const callResolver = await resolver.signup(obj, mockContext);
          expect(
            callResolver.errors.find((el) => el.field === 'password'),
          ).toBeDefined();
        });
        it('password works', async () => {
          const callResolver = await resolver.signup(
            { ...obj, password: 'Testing12345' },
            mockContext,
          );
          expect(
            callResolver.errors.find((e) => e.field === 'password'),
          ).not.toBeDefined();
        });
      });
      describe('creatingUserFail', () => {
        const validSignup: SignupDto = {
          email: 'andre@gmail.com',
          name: 'Andre',
          password: 'Passwird1234.',
        };
        it('non unique email', async () => {
          const mockContext = createMock<GqlContext>({
            prisma: {
              user: {
                // creating a fake context so when prisma.user.create is called in the resolver it throws and error
                create: jest
                  .fn()
                  .mockRejectedValue(new Error('constraint email')),
              },
            },
          });
          const callResolver = await resolver.signup(validSignup, mockContext);
          expect(callResolver.errors).toStrictEqual([
            { field: 'email', message: 'this email is already taken' },
          ]);

          expect(callResolver.user).not.toBeDefined();
        });
        it('internal server error', async () => {
          const mockContext = createMock<GqlContext>({
            prisma: {
              user: {
                // creating a fake context so when prisma.user.create is called in the resolver it throws and error
                create: jest
                  .fn()
                  .mockRejectedValue(new Error('oops i did it again')),
              },
            },
          });
          const callResolver = await resolver.signup(validSignup, mockContext);
          expect(callResolver.errors).toStrictEqual([
            {
              field: 'internal server error',
              message: 'please check your console',
            },
          ]);
          expect(callResolver.user).not.toBeDefined();
        });
      });
    });
    describe('works', () => {
      const validSignup: SignupDto = {
        email: 'andre@andre.com',
        password: '1234Password',
        name: 'Name with many chars',
      };

      const mockContext = createMock<GqlContext>({
        req: {
          session: {},
        },
        prisma: {
          user: {
            //fake context with an expected value returned
            create: jest.fn().mockResolvedValue({
              ...validSignup,
              role: 'USER',
              id: '123456789',
            }),
          },
        },
      });
      it('works', async () => {
        const callResolver = await resolver.signup(validSignup, mockContext);

        expect(callResolver.errors).not.toBeDefined();
        expect(callResolver.user).toStrictEqual({
          ...validSignup,
          role: 'USER',
          id: '123456789',
        });
        expect(mockContext.req.session.userId).toBe('123456789');
      });
    });
  });
  describe('Logout', () => {
    describe('errors', () => {
      describe('no cookie', () => {
        it('returns false with no cookie', async () => {
          const mockCtxNoReq = createMock<GqlContext>();
          const callResolver = await resolver.logout(mockCtxNoReq);
          expect(callResolver).toBe(false);
          const mockCtxNoHeaders = createMock<GqlContext>({
            req: {},
          });
          const callResolverNoH = await resolver.logout(mockCtxNoHeaders);
          expect(callResolverNoH).toBe(false);
          const mockCtxNoCookies = createMock<GqlContext>({
            req: {
              headers: {},
            },
          });
          const callResolverNoC = await resolver.logout(mockCtxNoCookies);
          expect(callResolverNoC).toBe(false);

          const mockCtxNotCookieName = createMock<GqlContext>({
            req: {
              headers: {
                cookie: '1234',
              },
            },
          });
          const callResolverNoCookieName = await resolver.logout(
            mockCtxNotCookieName,
          );
          expect(callResolverNoCookieName).toBe(false);
        });
      });
      describe('no user', () => {
        it('no user and no cookie', async () => {
          const mockCtx = createMock<GqlContext>({
            req: {
              session: {
                userId: null,
              },
              headers: {
                cookie: 'bla bla bla bla',
              },
            },
            res: {
              clearCookie: jest.fn(),
            },
          });
          const calledResolver = await resolver.logout(mockCtx);
          expect(calledResolver).toBe(false);
          expect(mockCtx.res.clearCookie).not.toHaveBeenCalled();
        });
        it('no user but cookie', async () => {
          const mockCtx = createMock<GqlContext>({
            req: {
              session: {
                userId: null,
              },
              headers: {
                cookie: COOKIE_NAME,
              },
            },
            res: {
              clearCookie: jest.fn(),
            },
          });
          const calledResolver = await resolver.logout(mockCtx);
          expect(mockCtx.res.clearCookie).toHaveBeenCalled();
          expect(mockCtx.res.clearCookie).toHaveBeenCalledWith(COOKIE_NAME);
          expect(calledResolver).toBe(false);
        });
      });

      it('destroy error', async () => {
        const mockCtx = createMock<GqlContext>({
          req: {
            session: {
              userId: '123' as any,
              destroy: jest
                .fn()
                .mockImplementation((fn) => fn(new Error('PROBLEMS'))) as any,
            },
            headers: {
              cookie: COOKIE_NAME,
            },
          },
          res: {
            clearCookie: jest.fn(),
          },
        });
        const calledResolver = await resolver.logout(mockCtx);
        expect(calledResolver).toBe(false);
      });
    });
    describe('logs out', () => {
      const mockCtx = createMock<GqlContext>({
        req: {
          headers: {
            cookie: COOKIE_NAME,
          },
          session: {
            userId: '123' as any,
            destroy: jest.fn().mockImplementation((fn) => fn()) as any,
          },
        },
        res: {
          clearCookie: jest.fn(),
        },
      });
      it('works', async () => {
        const callResolver = await resolver.logout(mockCtx);
        expect(callResolver).toBe(true);
        expect(mockCtx.res.clearCookie).toHaveBeenCalled();
        expect(mockCtx.res.clearCookie).toHaveBeenCalledWith(COOKIE_NAME);
      });
    });
  });

  describe('Login', () => {
    const input: LogInDto = {
      email: 'andre@andre.com',
      password: 'Password1234',
    };
    describe('error states', () => {
      describe('input validation', () => {
        const mockCtx = createMock<GqlContext>();

        describe('bad email', () => {
          const input: LogInDto = {
            email: 'asd',
            password: '123',
          };
          it('fails with not a good email', async () => {
            const callResolver = await resolver.login(input, mockCtx);
            expect(callResolver.user).not.toBeDefined();
            expect(
              callResolver.errors.find((e) => e.field === 'email'),
            ).toBeDefined();
          });
        });
        describe('general bad inputs', () => {
          it('with array inputs', async () => {
            const callResolver = await resolver.login(
              {
                // @ts-expect-error
                email: [],
                // @ts-expect-error
                password: [],
              },
              mockCtx,
            );
            expect(callResolver.errors.length).toBeGreaterThan(1);
          });
        });
      });

      it('no user with email', async () => {
        const mockCtx = createMock<GqlContext>({
          prisma: {
            user: {
              findUnique: jest.fn().mockResolvedValue(null),
            },
          },
        });
        const callResolver = await resolver.login(input, mockCtx);
        expect(callResolver.user).not.toBeDefined();
        expect(callResolver.errors[0].field).toBe('email');
      });

      it('wrong password', async () => {
        const mockCtx = createMock<GqlContext>({
          prisma: {
            user: {
              findUnique: jest.fn().mockResolvedValue({ ...input, id: '123' }),
            },
          },
        });

        const callResolver = await resolver.login(input, mockCtx);
        expect(callResolver.user).not.toBeDefined();
        expect(callResolver.errors[0].field).toBe('credentials');
      });

      it('internal errors', async () => {
        const mockCtx = createMock<GqlContext>({
          prisma: {
            user: {
              findUnique: jest.fn().mockRejectedValue(new Error('Oppsie')),
            },
          },
        });
        const callResolver = await resolver.login(input, mockCtx);

        expect(callResolver.user).not.toBeDefined();
        expect(callResolver.errors[0].field).toMatch(/internal server error/gi);
      });
    });

    describe('Success', () => {
      it('works', async () => {
        const hashPass = await hash(input.password, await genSalt());

        const mockCtx = createMock<GqlContext>({
          req: {
            session: {},
          },
          prisma: {
            user: {
              findUnique: jest
                .fn()
                .mockResolvedValue({ ...input, password: hashPass, id: '123' }),
            },
          },
        });
        const callResolver = await resolver.login({ ...input }, mockCtx);
        expect(callResolver.errors).not.toBeDefined();
        expect(callResolver.user).toStrictEqual({
          ...input,
          password: hashPass,
          id: '123',
        });
        expect(mockCtx.req.session.userId).toBe('123');
      });
    });
  });
});
