import {
  Args,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';

@InputType()
class CreateUserDto {
  @Field(() => String)
  username: string;
}

@Resolver()
export class UsersResolver {
  @Query(() => String)
  hello() {
    return 'hello world';
  }

  @Mutation(() => Boolean)
  createUser(@Args('createUserOptions') createUserDto: CreateUserDto) {
    return true;
  }
}
