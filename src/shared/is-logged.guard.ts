import {
  CanActivate,
  ExecutionContext,
  Injectable,
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
    return false;
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
