import { User as PrismaUser } from '@prisma/client';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { BaseResponse } from 'src/utils/base.response';

enum Role {
  ADVERTISER = 'ADVERTISER',
  USER = 'USER',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'The possible roles of a user',
});

@ObjectType()
export class User implements PrismaUser {
  @Field(() => String)
  id: string;
  @Field(() => String)
  createdAt: Date;
  @Field(() => String)
  updatedAt: Date;
  @Field(() => String)
  name: string;
  @Field(() => String)
  profilePic: string;
  @Field(() => String)
  email: string;

  password: string;

  @Field(() => Role)
  role: 'ADVERTISER' | 'USER';
}

@ObjectType()
export class UserResponse extends BaseResponse {
  @Field(() => User, { nullable: true })
  user?: User;
}
