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
  UseGuards,
  Req,
  ForbiddenException,
  Query,
} from "@nestjs/common"
import { UserService } from "./user.service"
import {
  UserCreateImpl,
  UserUpdateImpl,
  UserDTOImpl,
  AvailabilityCheckDTOImpl,
} from "./dto/user-dto"
import { AuthGuard } from "../auth/auth.guard"
import { Request } from "@nestjs/common"
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<UserDTOImpl[]> {
    const users = await this.userService.findAll()
    return users.map((user) => new UserDTOImpl(user))
  }

  @Get("availability")
  async checkAvailability(
    @Query("username") username: string,
  ): Promise<AvailabilityCheckDTOImpl> {
    const isAvailable = await this.userService.checkAvailability(username)
    return new AvailabilityCheckDTOImpl(username, isAvailable)
  }

  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<UserDTOImpl> {
    const user = await this.userService.findOne({ id })
    if (!user) {
      throw new NotFoundException("User not found.")
    }
    return new UserDTOImpl(user)
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateUserDto: UserUpdateImpl,
    @Req() req: any,
  ): Promise<UserDTOImpl> {
    // Ensure that users can only update their own data
    if (req.user.id !== id) {
      throw new ForbiddenException("You can only update your own user data.")
    }
    const user = await this.userService.update(id, updateUserDto)
    return new UserDTOImpl(user)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: any,
  ): Promise<UserDTOImpl> {
    // Ensure that users can only delete their own data
    if (req.user.id !== id) {
      throw new ForbiddenException("You can only delete your own user data.")
    }
    const user = await this.userService.remove(id)
    return new UserDTOImpl(user)
  }
}
