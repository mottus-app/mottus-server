import { Organization as PrismaOrganization } from '@prisma/client';
import { ObjectType, Field } from '@nestjs/graphql';
import { BaseResponse } from 'src/utils/base.response';
import { User } from 'src/users/entity/user.entity';

@ObjectType()
export class Organization implements PrismaOrganization {
  @Field(() => String)
  id: string;

  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  companyPic: string | null;

  @Field(() => [User])
  workers?: User[];

  @Field(() => User)
  owner?: User;

  ownerId: string;
}

@ObjectType()
export class OrganizationResponse extends BaseResponse {
  @Field(() => Organization, { nullable: true })
  organization?: Organization;
}
@ObjectType()
export class OrganizationsResponse extends BaseResponse {
  @Field(() => [Organization], { nullable: true })
  organizations?: Organization[];
}

@ObjectType()
export class AddToOrgResponse extends BaseResponse {
  @Field(() => Boolean, { nullable: true })
  worked?: boolean;
}
