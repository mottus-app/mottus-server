import { Injectable } from '@nestjs/common';
import { GqlContext } from 'src/utils/gqlContext';
import { SignupDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { UserResponse } from './entity/user.entity';
import { COOKIE_NAME } from 'src/utils/cookieName';
import validator from 'validator';
import { FieldError } from 'src/utils/base.response';

@Injectable()
export class UsersService {
  async getMe({ req, prisma, res }: GqlContext): Promise<UserResponse> {
    if (!req.session?.userId) {
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
    const errors = this.signupValidation(signupDto);
    if (errors) {
      return { errors };
    }
    // you get the password value and call it toHash
    const { password: toHash } = signupDto;

    try {
      const password = await bcrypt.hash(toHash, await bcrypt.genSalt());

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
      // if (error.code === 'P2002' || error.message.includes('constraint')) {

      if (error.message.match(/constraint|email/gi)) {
        return {
          errors: [{ field: 'email', message: 'this email is already taken' }],
        };
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
    const errors = this.loginValidation(loginDto);
    if (errors) {
      return { errors };
    }

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

  async logout({ req, res }: GqlContext) {
    if (!req.headers?.cookie?.includes(COOKIE_NAME)) {
      return false;
    }

    res.clearCookie(COOKIE_NAME);

    if (!req.session.userId) {
      return false;
    }

    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          console.log('ERRORRRR', err.message, err.code);
          return resolve(false);
        }
        resolve(true);
      });
    });
  }

  private signupValidation(signupDto: SignupDto): FieldError[] | false {
    const errors: FieldError[] = [];
    if (
      typeof signupDto.name !== 'string' ||
      !validator.isLength(signupDto.name, { min: 5 })
    ) {
      errors.push({
        field: `name`,
        message: `Your name is too short. Please have, at least, 5 chars`,
      });
    }

    if (
      typeof signupDto.email !== 'string' ||
      !validator.isEmail(signupDto.email)
    ) {
      errors.push({
        field: 'email',
        message: 'Invalid email',
      });
    }

    if (
      typeof signupDto.password !== 'string' ||
      !validator.matches(
        signupDto.password,
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
      )
    ) {
      errors.push({
        field: `password`,
        message: `your password is shit. please have minimum of 8 chars, 1 number, one small letter, and one big letter`,
      });
    }

    return errors.length ? errors : false;
  }
  private loginValidation(loginDto: LogInDto): FieldError[] | false {
    const errors: FieldError[] = [];
    if (typeof loginDto.password !== 'string' || !loginDto.password) {
      errors.push({
        field: 'password',
        message: 'Please write a password',
      });
    }
    if (
      typeof loginDto.email !== 'string' ||
      !validator.isEmail(loginDto.email)
    ) {
      errors.push({
        field: 'email',
        message: 'Please write a valid email',
      });
    }
    return errors.length ? errors : false;
  }
}
