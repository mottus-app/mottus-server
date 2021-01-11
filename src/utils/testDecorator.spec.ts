import { UserResponse } from 'src/users/entity/user.entity';
import { FieldError } from './base.response';
import {
  returnBoolean,
  returnString,
  returnUserResponse,
  returnFieldErrorArr,
} from './utilDecorators';

describe('returnsString', () => {
  it('works', () => {
    expect(true).toBeTruthy();
  });
  it('returns String', () => {
    expect(returnString()).toBe(String);
  });
});

describe('returnsUserResponse', () => {
  it('returns UserRreposne', () => {
    expect(returnUserResponse()).toBe(UserResponse);
  });
});

describe('returnBoolean', () => {
  it('just works', () => {
    expect(returnBoolean()).toBe(Boolean);
  });
});

describe('returnErrorFieldArr', () => {
  it('just works', () => {
    expect(returnFieldErrorArr()).toStrictEqual([FieldError]);
  });
});
