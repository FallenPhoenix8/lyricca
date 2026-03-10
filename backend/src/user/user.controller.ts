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
  UseInterceptors,
  UploadedFile,
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
import { FileInterceptor } from "@nestjs/platform-express"
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<UserDTOImpl[]> {
    const users = await this.userService.findAll()
    return users.map((user) => new UserDTOImpl(user))
  }

  @UseGuards(AuthGuard)
  @Get("me")
  async findMe(@Req() req: any): Promise<UserDTOImpl> {
    const user = await req.user()
    return new UserDTOImpl(user)
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
  @UseInterceptors(FileInterceptor("profile-picture"))
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateUserDto: UserUpdateImpl,
    @Req() req: any,
    @UploadedFile() profilePictureFile?: Express.Multer.File,
  ): Promise<UserDTOImpl> {
    // Ensure that users can only update their own data
    const requestUser = await req.user()
    if (requestUser.id !== id) {
      throw new ForbiddenException("You can only update your own user data.")
    }
    // If a profile picture is provided, upload it to the storage
    if (profilePictureFile) {
      await this.userService.uploadProfilePicture(id, profilePictureFile)
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
    if ((await req.user().id) !== id) {
      throw new ForbiddenException("You can only delete your own user data.")
    }
    const user = await this.userService.remove(id)
    return new UserDTOImpl(user)
  }
}
