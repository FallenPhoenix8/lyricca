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
    const existingUser = await this.databaseService.user.findUnique({
      where: { username: createUserDto.username },
    })
    if (existingUser) {
      throw new ConflictException("Username already exists.")
    }
    // * MARK: - Create user in database
    const user = await this.databaseService.user.create({
      data: {
        username: createUserDto.username,
        password: createUserDto.password,
      },
      include: {
        songs: {
          include: {
            cover: true,
          },
        },
      },
    })

    return new UserImpl(user)
  }

  async findAll(): Promise<UserImpl[]> {
    const users = await this.databaseService.user.findMany({
      include: {
        songs: {
          include: {
            cover: true,
          },
        },
      },
    })
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
      ? await this.databaseService.user.findUnique({
          where: { id: properties.id },
          include: {
            songs: {
              include: {
                cover: true,
              },
            },
          },
        })
      : await this.databaseService.user.findUnique({
          where: { username: properties.username },
          include: {
            songs: {
              include: {
                cover: true,
              },
            },
          },
        })
    if (!user) {
      return null
    }
    return new UserImpl(user)
  }

  async update(id: string, updateUserDto: UserUpdateImpl): Promise<UserImpl> {
    const user = await this.databaseService.user.update({
      where: { id },
      data: {
        username: updateUserDto.username,
        password: updateUserDto.password,
      },
      include: {
        songs: {
          include: {
            cover: true,
          },
        },
      },
    })
    return new UserImpl(user)
  }

  async remove(id: string): Promise<UserImpl> {
    const user = await this.databaseService.user.delete({
      where: { id },
      include: {
        songs: {
          include: {
            cover: true,
          },
        },
      },
    })
    return new UserImpl(user)
  }
}
