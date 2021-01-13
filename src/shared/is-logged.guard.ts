import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { GqlContext } from 'src/utils/gqlContext';

@Injectable()
export class IsLoggedGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    throw new UnauthorizedException('Not authenticated');
    const ctx = GqlExecutionContext.create(context);
    const myContext: GqlContext = ctx.getContext();
    console.log('req:', Object.keys(myContext));
    if (!myContext?.req?.session?.userId) {
      return false;
    }
    return true;
  }
}

export const IsLogged = () => UseGuards(IsLoggedGuard);
