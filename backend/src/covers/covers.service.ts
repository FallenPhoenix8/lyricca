import { Injectable } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"
import { v7 as uuid } from "uuid"
import { DatabaseService } from "../database/database.service"
import { CoverDTOImpl, CoverUpdateDTOImpl } from "./dto/cover-dto"

@Injectable()
export class CoversService {
  private readonly bucketName = "covers"

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(file: File) {
    const fileExtension = file.name.split(".").pop()
    const fileName = uuid()
    const filePath = `${fileName}.${fileExtension}`

    const uploadedFile = await this.supabaseService.storage
      .from(this.bucketName)
      .upload(filePath, file)

    if (uploadedFile.error) {
      throw new Error(`Failed to upload file: ${uploadedFile.error.message}`)
    }

    const {
      data: { publicUrl },
    } = this.supabaseService.storage
      .from(this.bucketName)
      .getPublicUrl(uploadedFile.data.path)

    const cover = await this.databaseService.cover.create({
      data: {
        url: publicUrl,
      },
    })

    return new CoverDTOImpl(cover)
  }

  async findOne(props: { id: string }): Promise<CoverDTOImpl | null> {
    const cover = await this.databaseService.cover.findUnique({
      where: { id: props.id },
    })
    if (!cover) {
      return null
    }
    return new CoverDTOImpl(cover)
  }

  async remove(id: string): Promise<CoverDTOImpl> {
    const cover = await this.databaseService.cover.delete({
      where: { id },
    })
    return new CoverDTOImpl(cover)
  }
}
