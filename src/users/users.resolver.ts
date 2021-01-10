import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { GqlContext } from 'src/utils/gqlContext';
import { SignupDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import { User, UserResponse } from './entity/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
  @Query(() => UserResponse)
  me(@Context() context: GqlContext) {
    return this.usersService.getMe(context);
  }

  @Mutation(() => UserResponse)
  signup(
    @Args('signupOptions') signupDto: SignupDto,
    @Context() context: GqlContext,
  ) {
    return this.usersService.signup(signupDto, context);
  }

  @Mutation(() => UserResponse)
  login(
    @Args('loginOptions') loginDto: LogInDto,
    @Context() context: GqlContext,
  ) {
    return this.usersService.login(loginDto, context);
  }

  @Mutation(() => Boolean)
  logout(@Context() context: GqlContext) {
    return this.usersService.logout(context);
  }
}
