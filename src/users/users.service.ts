import { Injectable } from '@nestjs/common';
import { GqlContext } from 'src/utils/gqlContext';
import { SignupDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { UserResponse } from './entity/user.entity';
import { COOKIE_NAME } from 'src/utils/cookieName';

@Injectable()
export class UsersService {
  // constructor(private readonly dbService: DbService) {}
  async getMe({ req, prisma, res }: GqlContext): Promise<UserResponse> {
    if (!req.session.userId) {
      return {
        user: null,
      };
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.session.userId,
        },
      });
      if (!user) {
        res.clearCookie(COOKIE_NAME);
        return {
          user: null,
        };
      }
      return {
        user,
      };
    } catch (error) {
      console.log('ERROR: ', error.code, error.message);
      return {
        errors: [
          { field: 'internal server error', message: 'please try again later' },
        ],
      };
    }
  }

  async signup(
    signupDto: SignupDto,
    context: GqlContext,
  ): Promise<UserResponse> {
    // TODO do error validation on request (class validator styylez)
    // you get the password value and call it toHash
    const { password: toHash } = signupDto;

    const password = await bcrypt.hash(toHash, await bcrypt.genSalt());

    try {
      const user = await context.prisma.user.create({
        data: {
          ...signupDto,
          password,
          role: 'USER',
        },
      });

      // NOW THE USER IS LOGGED IN
      context.req.session.userId = user.id;
      return { user };
    } catch (error) {
      if (error.code === 'P2002' || error.message.includes('constraint')) {
        if (error.message.includes('email')) {
          return {
            errors: [
              { field: 'email', message: 'this email is already taken' },
            ],
          };
        }
      }
      console.log('ERROR', error.message, error.code);
      return {
        errors: [
          {
            field: 'internal server error',
            message: `please check your console`,
          },
        ],
      };
    }
  }

  async login(loginDto: LogInDto, context: GqlContext): Promise<UserResponse> {
    const { password: toBeDecrypted, email } = loginDto;

    try {
      const user = await context.prisma.user.findUnique({
        where: { email: email },
      });
      if (!user) {
        return {
          errors: [
            {
              field: 'email',
              message: `email does not exist`,
            },
          ],
        };
      }
      const isValid = await bcrypt.compare(toBeDecrypted, user.password);
      if (!isValid) {
        return {
          errors: [
            {
              field: 'credentials',
              message: `Invalid credentials`,
            },
          ],
        };
      }
      context.req.session.userId = user.id;
      return { user };
    } catch (error) {
      console.log('ERROR', error.message, error.code);
      return {
        errors: [
          {
            field: 'internal server error',
            message: 'please check your console',
          },
        ],
      };
    }
  }

  logout({ req, res }: GqlContext) {
    if (req.headers?.cookie?.includes(COOKIE_NAME)) {
      res.clearCookie(COOKIE_NAME);
    }
    if (!req.session.userId) {
      return true;
    }

    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          console.log('ERRORRRR', err.message, err.code);
          return resolve(true);
        }
        resolve(true);
      });
    });
  }
}
