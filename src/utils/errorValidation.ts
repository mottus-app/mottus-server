import { GraphQLError } from 'graphql';

export function validateError(err: GraphQLError) {
  const exceptionThrown = err?.extensions?.exception;
  if (!exceptionThrown?.response) {
    return null;
  }
  const isValidation = matchStr(err, 'validationPIPE');
  if (isValidation) {
    console.log('here');
    return exceptionThrown.response.message.map((el: string) => {
      return {
        field: el.split(' ')[0],
        message: el.split(' ').slice(1).join(' '),
      };
    });
  }
  const isAuth = matchStr(err, 'canActivate');
  if (isAuth) {
    console.log('AUTH');
    return [
      {
        field: 'auth',
        message: 'you are not authenticated',
      },
    ];
  }
}

function matchStr(err: GraphQLError, element: string) {
  return err?.extensions?.exception?.stacktrace?.find((e: string) =>
    e.match(new RegExp(element, 'gi')),
  );
}
