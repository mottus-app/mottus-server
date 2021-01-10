import { UserResponse } from 'src/users/entity/user.entity';
import {
  returnBoolean,
  returnString,
  returnUserResponse,
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
