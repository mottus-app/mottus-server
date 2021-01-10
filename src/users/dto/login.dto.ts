import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LogInDto {
  @Field(() => String)
  password: string;

  @Field(() => String)
  email: string;
}
