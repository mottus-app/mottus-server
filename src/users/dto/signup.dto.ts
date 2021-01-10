import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SignupDto {
  @Field(() => String)
  name: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  profilePic?: string;
}
