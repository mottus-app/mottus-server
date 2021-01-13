import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IsLogged } from './shared/is-logged.guard';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @IsLogged()
  getHello(): string {
    return this.appService.getHello();
  }
}
