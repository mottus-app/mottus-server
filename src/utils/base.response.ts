import { ObjectType, Field } from '@nestjs/graphql';
import { returnString } from './utilDecorators';

@ObjectType()
export class FieldError {
  @Field(
    /* istanbul ignore next */
    () => String,
  )
  field: string;
  @Field(
    /* istanbul ignore next */
    () => String,
  )
  message: string;
}

@ObjectType()
export class BaseResponse {
  @Field(
    /* istanbul ignore next */
    () => [FieldError],
    { nullable: true },
  )
  errors?: FieldError[];
}
