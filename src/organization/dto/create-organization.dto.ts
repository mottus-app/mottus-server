import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateOrganizationDto {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  companyPic?: string;
}
