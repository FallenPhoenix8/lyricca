import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from "@nestjs/common"
import { UserService } from "./user.service"
import { UserCreateImpl, UserUpdateImpl, UserDTOImpl } from "./dto/user-dto"

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: UserCreateImpl): Promise<UserDTOImpl> {
    return await this.userService.create(createUserDto)
  }

  @Get()
  async findAll(): Promise<UserDTOImpl[]> {
    return await this.userService.findAll()
  }

  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<UserDTOImpl> {
    return await this.userService.findOne(id)
  }

  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateUserDto: UserUpdateImpl,
  ): Promise<UserDTOImpl> {
    return await this.userService.update(id, updateUserDto)
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<UserDTOImpl> {
    return await this.userService.remove(id)
  }
}
