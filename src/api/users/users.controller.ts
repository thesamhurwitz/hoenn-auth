import { Body, Delete, Get, JsonController, Param, Patch, QueryParams } from 'routing-controllers';
import { FindAllQuery } from 'src/types/find-all-query';
import { PatchUserDto } from './dto/patch-user.dto';
import { UsersService } from '../../services/users.service';

@JsonController('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Get()
  async findAll(@QueryParams() { take, skip }: FindAllQuery) {
    return this.usersService.findAll({ take, skip });
  }

  @Get('/:username')
  async findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }

  // @Post()
  // async create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @Patch('/:username')
  async patch(@Param('username') username: string, @Body() patchUserDto: PatchUserDto) {
    return this.usersService.patch(username, patchUserDto);
  }

  @Delete('/:username')
  async delete(@Param('username') username: string) {
    return this.usersService.delete(username);
  }

}
