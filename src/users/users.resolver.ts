import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlContext } from 'src/utils/gqlContext';
import { returnString, returnUserResponse } from 'src/utils/utilDecorators';
import { LogInDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { User, UserResponse } from './entity/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(returnString)
  hello() {
    return `hello`;
  }

  @Query(returnUserResponse)
  me(@Context() context: GqlContext) {
    return this.usersService.getMe(context);
  }

  @Mutation(returnUserResponse)
  signup(
    @Args('signupOptions') signupDto: SignupDto,
    @Context() context: GqlContext,
  ) {
    return this.usersService.signup(signupDto, context);
  }

  @Mutation(returnUserResponse)
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
