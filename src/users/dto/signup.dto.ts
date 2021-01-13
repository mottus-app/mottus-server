import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class SignupDto {
  @Field(() => String)
  @IsString()
  @MinLength(10)
  name: string;

  @Field(() => String)
  @IsString()
  @MinLength(10)
  password: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  profilePic?: string;
}
