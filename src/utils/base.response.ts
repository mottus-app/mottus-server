import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class FieldError {
  @Field(() => String)
  field: string;
  @Field(() => String)
  message: string;
}

@ObjectType()
export class BaseResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
