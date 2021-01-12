import { Injectable } from '@nestjs/common';
import { GqlContext } from 'src/utils/gqlContext';
import { AddToOrgDto } from './dto/add-to-org.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import {
  AddToOrgResponse,
  OrganizationResponse,
  OrganizationsResponse,
} from './entity/organization.entity';

@Injectable()
export class OrganizationService {
  async create(
    createOrganizationDto: CreateOrganizationDto,
    context: GqlContext,
  ): Promise<OrganizationResponse> {
    if (!context.req.session.userId) {
      return {
        errors: [{ field: 'unauthorized', message: 'You not logged in' }],
      };
    }
    // !TODO DO VALIDATION OF INPUT

    try {
      const organization = await context.prisma.organization.create({
        data: {
          ...createOrganizationDto,
          workers: {
            connect: {
              id: context.req.session.userId,
            },
          },
          owner: {
            connect: {
              id: context.req.session.userId,
            },
          },
        },
      });

      return { organization };
    } catch (error) {
      if (error.message.match(/constraint|name/gi)) {
        return {
          errors: [
            {
              field: 'company name',
              message: 'this company name is already taken',
            },
          ],
        };
      }
      return {
        errors: [
          {
            field: 'internal server error',
            message: 'please check your console',
          },
        ],
      };
    }
  }

  async getAllOrgs({ prisma }: GqlContext) {
    const organizations = await prisma.organization.findMany({
      // include: { workers: true },
    });
    return { organizations };
  }

  async addToOrg(
    addToOrgDto: AddToOrgDto,
    context: GqlContext,
  ): Promise<AddToOrgResponse> {
    if (!context.req.session.userId) {
      return {
        errors: [
          { field: 'not authenticated', message: 'you are not logged in' },
        ],
      };
    }

    const organization = await context.prisma.organization.findUnique({
      where: {
        id: addToOrgDto.orgId,
      },
    });
    if (!organization) {
      return {
        errors: [{ field: 'organizationId', message: 'no such organization' }],
      };
    }

    if (organization.ownerId !== context.req.session.userId) {
      return {
        errors: [
          { field: 'not authenticated', message: 'you are not logged in' },
        ],
      };
    }

    await context.prisma.organization.update({
      where: {
        id: organization.id,
      },
      data: {
        workers: {
          connect: {
            id: addToOrgDto.userIdToAdd,
          },
        },
      },
    });

    return {
      worked: true,
    };
  }
}
