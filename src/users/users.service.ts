import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class UsersService {
  constructor(private readonly dbService: DbService) {}

  getUsers() {
    return this.dbService.user.findMany();
  }

  create() {}
}
