import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { UserCreateImpl, UserUpdateImpl, UserDTOImpl } from "./dto/user-dto"
import { DatabaseService } from "../database/database.service"

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: UserCreateImpl): Promise<UserDTOImpl> {
    // * MARK: - Check if username already exists
    const existingUser = await this.databaseService.users.findUnique({
      where: { username: createUserDto.username },
    })
    if (existingUser) {
      throw new ConflictException("Username already exists.")
    }
    // * MARK: - Create user in database
    const user = await this.databaseService.users.create({
      data: {
        username: createUserDto.username,
        password: createUserDto.password,
      },
    })

    return new UserDTOImpl(user)
  }

  async findAll(): Promise<UserDTOImpl[]> {
    const users = await this.databaseService.users.findMany()
    return users.map((user) => new UserDTOImpl(user))
  }

  async findOne(id: string): Promise<UserDTOImpl> {
    const user = await this.databaseService.users.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundException("User not found.")
    }
    return new UserDTOImpl(user)
  }

  async update(
    id: string,
    updateUserDto: UserUpdateImpl,
  ): Promise<UserDTOImpl> {
    const user = await this.databaseService.users.update({
      where: { id },
      data: {
        username: updateUserDto.username,
        password: updateUserDto.password,
      },
    })
    return new UserDTOImpl(user)
  }

  async remove(id: string): Promise<UserDTOImpl> {
    const user = await this.databaseService.users.delete({
      where: { id },
    })
    return new UserDTOImpl(user)
  }
}
