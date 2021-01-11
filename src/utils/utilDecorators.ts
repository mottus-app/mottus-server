import { UserResponse } from 'src/users/entity/user.entity';
import { FieldError } from './base.response';

export const returnString = () => String;
export const returnUserResponse = () => UserResponse;
export const returnBoolean = () => Boolean;
export const returnFieldErrorArr = () => [FieldError];
