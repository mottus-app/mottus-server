import { HttpStatus } from '@nestjs/common';
import { GraphQLError } from 'graphql';

export interface ExtendedError extends GraphQLError {
  extensions: {
    code: string;
    exception?: {
      response?: {
        statusCode: HttpStatus;
        message: string | string[];
        error: string;
      };
      status: HttpStatus;
      message: string;
      stackstrace: string[];
    };
  };
}

export function validateError(err: ExtendedError) {
  const exceptionThrown = err?.extensions?.exception;
  if (!exceptionThrown?.response) {
    return null;
  }
  const isValidation = matchStr(err, 'validationPipe');
  if (isValidation) {
    return (exceptionThrown.response.message as string[]).reduce((acc, val) => {
      const [field] = val.split(' ');
      return [...acc, { field, message: val }];
    }, []);
  }
  const isAuth = checkAuthError(err);
  if (isAuth) {
    return [{ field: 'auth', message: 'not authenticated' }];
  }
}

function checkAuthError(err: ExtendedError) {
  const statusCode = err?.extensions?.exception?.response.statusCode;
  return (
    statusCode === HttpStatus.UNAUTHORIZED ||
    statusCode === HttpStatus.FORBIDDEN
  );
}

function matchStr(err: GraphQLError, element: string) {
  return err.extensions.exception.stacktrace.find((e: string) =>
    e.match(new RegExp(element, 'gi')),
  );
}
