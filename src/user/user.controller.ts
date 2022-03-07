import { Request } from 'express';
import { Controller, Get, ContentType, Req, Post, Put, Patch, Delete } from 'routing-controllers';

@Controller()
export class UserController {
  @Get('/users')
  @ContentType('application/json')
  getAll() {
    return [
      { id: 1, name: 'First user!' },
      { id: 2, name: 'Second user!' },
    ];
  }

  @Get('/users/:id')
  getOne(@Req() request: Request) {
    return `User #${request.params.id}`;
  }

  @Post('/users')
  post(@Req() request: Request) {
    const user = JSON.stringify(request.body); // probably you want to install body-parser for express
    return `User ${user} !saved!`;
  }

  @Put('/users/:id')
  put(@Req() request: Request) {
    return `User #${request.params.id} has been putted!`;
  }

  @Patch('/users/:id')
  patch(@Req() request: Request) {
    return `User #${request.params.id} has been patched!`;
  }

  @Delete('/users/:id')
  remove(@Req() request: Request) {
    return `User #${request.params.id} has been removed!`;
  }
}
