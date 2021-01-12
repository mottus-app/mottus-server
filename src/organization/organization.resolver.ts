import {
  Args,
  Context,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { User } from 'src/users/entity/user.entity';
import { GqlContext } from 'src/utils/gqlContext';
import { returnString } from 'src/utils/utilDecorators';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { AddToOrgDto } from './dto/add-to-org.dto';
import {
  AddToOrgResponse,
  Organization,
  OrganizationResponse,
  OrganizationsResponse,
} from './entity/organization.entity';
import { OrganizationService } from './organization.service';

@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(private readonly orgService: OrganizationService) {}

  @ResolveField(() => User)
  async owner(@Root() org: Organization, @Context() context: GqlContext) {
    const owner = await context.prisma.organization
      .findUnique({ where: { id: org.id } })
      .owner();
    return owner;
  }

  @ResolveField(() => [User])
  async workers(@Root() org: Organization, @Context() context: GqlContext) {
    //  console.log(
    //    await context.prisma.organization
    //      .findUnique({ where: { id: org.id } })
    //      .workers(),
    //  );

    return context.prisma.organization
      .findUnique({ where: { id: org.id } })
      .workers({ take: 5 });
  }

  @Mutation(() => OrganizationResponse)
  createOrganization(
    @Args('createOrganizationInput')
    createOrganizationDto: CreateOrganizationDto,
    @Context() context: GqlContext,
  ) {
    return this.orgService.create(createOrganizationDto, context);
  }

  @Query(() => OrganizationsResponse)
  getAllOrgs(@Context() context: GqlContext) {
    return this.orgService.getAllOrgs(context);
  }

  @Mutation(() => AddToOrgResponse)
  addToOrg(
    @Args('addToOrgOptions') addToOrgDto: AddToOrgDto,
    @Context() context: GqlContext,
  ) {
    return this.orgService.addToOrg(addToOrgDto, context);
  }
}
