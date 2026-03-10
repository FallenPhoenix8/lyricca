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
import { ImageService } from "../image/image.service"
import { v7 as uuid } from "uuid"
import { SupabaseService } from "../supabase/supabase.service"
import { AuthService } from "../auth/auth.service"
import { saltOrRounds } from "../auth/constants"
import { hash } from "bcrypt"

@Injectable()
export class UserService {
  private readonly saltOrRounds = saltOrRounds
  private readonly bucketName = "user-profiles"
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly imageService: ImageService,
    private readonly supabaseService: SupabaseService,
  ) {}

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
    let hashedPassword: string | undefined = undefined
    if (updateUserDto.password) {
      hashedPassword = await hash(updateUserDto.password, this.saltOrRounds)
    }
    const user = await this.databaseService.user.update({
      where: { id },
      data: {
        username: updateUserDto.username,
        password: hashedPassword,
        profile_url: updateUserDto.profile_url,
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

  async checkAvailability(username: string): Promise<boolean> {
    const user = await this.databaseService.user.findUnique({
      where: { username },
    })
    return user ? false : true
  }

  async uploadProfilePicture(id: string, file: Express.Multer.File) {
    const optimizedFile = await this.imageService.convertToOptimizedFile(file)
    const fileExtension = optimizedFile.name.split(".").pop()
    const fileName = uuid()
    const filePath = `${fileName}.${fileExtension}`

    const uploadedFile = await this.supabaseService.storage
      .from(this.bucketName)
      .upload(filePath, optimizedFile)

    if (uploadedFile.error) {
      throw new Error(`Failed to upload file: ${uploadedFile.error.message}`)
    }

    const {
      data: { publicUrl },
    } = this.supabaseService.storage
      .from(this.bucketName)
      .getPublicUrl(uploadedFile.data.path)

    const user = await this.databaseService.user.update({
      where: { id },
      data: {
        profile_url: publicUrl,
      },
    })

    return new UserDTOImpl(user)
  }
}
