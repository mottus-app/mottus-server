import { ObjectType, Field } from '@nestjs/graphql';
import { returnFieldErrorArr, returnString } from './utilDecorators';

@ObjectType()
export class FieldError {
  @Field(returnString)
  field: string;
  @Field(returnString)
  message: string;
}

@ObjectType()
export class BaseResponse {
  @Field(returnFieldErrorArr, { nullable: true })
  errors?: FieldError[];
}
