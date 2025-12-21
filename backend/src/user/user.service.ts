import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import {
  UserCreateImpl,
  UserUpdateImpl,
  UserDTOImpl,
  UserImpl,
} from "./dto/user-dto"
import { DatabaseService } from "../database/database.service"

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: UserCreateImpl): Promise<UserImpl> {
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

    return new UserImpl(user)
  }

  async findAll(): Promise<UserImpl[]> {
    const users = await this.databaseService.users.findMany()
    return users.map((user) => new UserImpl(user))
  }

  async findOne(properties: {
    id?: string
    username?: string
  }): Promise<UserImpl | null> {
    if (!properties.id && !properties.username) {
      return null
    }

    const user = properties.id
      ? await this.databaseService.users.findUnique({
          where: { id: properties.id },
        })
      : await this.databaseService.users.findUnique({
          where: { username: properties.username },
        })
    if (!user) {
      return null
    }
    return new UserImpl(user)
  }

  async update(id: string, updateUserDto: UserUpdateImpl): Promise<UserImpl> {
    const user = await this.databaseService.users.update({
      where: { id },
      data: {
        username: updateUserDto.username,
        password: updateUserDto.password,
      },
    })
    return new UserImpl(user)
  }

  async remove(id: string): Promise<UserImpl> {
    const user = await this.databaseService.users.delete({
      where: { id },
    })
    return new UserImpl(user)
  }
}
