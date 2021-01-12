import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AddToOrgDto {
  @Field(() => String)
  userIdToAdd: string;

  @Field(() => String)
  orgId: string;
}
