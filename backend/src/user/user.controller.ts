import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  NotFoundException,
} from "@nestjs/common"
import { UserService } from "./user.service"
import { UserCreateImpl, UserUpdateImpl, UserDTOImpl } from "./dto/user-dto"

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: UserCreateImpl): Promise<UserDTOImpl> {
    const user = await this.userService.create(createUserDto)
    return new UserDTOImpl(user)
  }

  @Get()
  async findAll(): Promise<UserDTOImpl[]> {
    const users = await this.userService.findAll()
    return users.map((user) => new UserDTOImpl(user))
  }

  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<UserDTOImpl> {
    const user = await this.userService.findOne({ id })
    if (!user) {
      throw new NotFoundException("User not found.")
    }
    return new UserDTOImpl(user)
  }

  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateUserDto: UserUpdateImpl,
  ): Promise<UserDTOImpl> {
    const user = await this.userService.update(id, updateUserDto)
    return new UserDTOImpl(user)
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<UserDTOImpl> {
    const user = await this.userService.remove(id)
    return new UserDTOImpl(user)
  }
}
