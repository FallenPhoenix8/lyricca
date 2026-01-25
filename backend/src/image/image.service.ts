import { BadRequestException, Injectable } from "@nestjs/common"
import sharp from "sharp"
import { fileTypeFromBuffer } from "file-type"

@Injectable()
export class ImageService {
  readonly maxUploadBytes = 10 * 1024 * 1024 // 10 MB
  readonly maxInputPixels = 40_000_000 // 40 million pixels
  readonly maxWidth = 5000 // pixels
  readonly maxHeight = 5000 // pixels

  readonly allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"])
  readonly allowedFileExtensions = new Set(["jpg", "jpeg", "png", "webp"])

  async fileFilter(
    req: any,
    file: {
      fieldname: string
      originalname: string
      encoding: string
      mimetype: string
      size: number
      destination: string
      filename: string
      path: string
      buffer: Buffer<ArrayBufferLike>
    },
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): Promise<void> {}

  /**
   * Validates and optimizes an uploaded image file.
   * @param file - Uploaded image file
   * @returns Optimized image buffer, MIME type (image/webp), and dimensions
   */
  async validateAndOptimizeImage(file: Express.Multer.File): Promise<{
    buffer: Buffer
    mimeType: string
    width: number
    height: number
  }> {
    // * MARK: - Validate file type from content
    const fileType = await fileTypeFromBuffer(file.buffer)
    if (!fileType || !this.allowedMimeTypes.has(fileType.mime)) {
      throw new BadRequestException(
        `Invalid file type. Allowed file types: ${[...this.allowedFileExtensions].map((ext) => `.${ext}`).join(", ")}`,
      )
    }

    // * MARK: - Decode safely and read metadata
    try {
      const input = sharp(file.buffer, {
        failOnError: true,
        limitInputPixels: this.maxInputPixels,
      })

      const outBuffer = await input
        .rotate()
        .resize({
          width: this.maxWidth,
          height: this.maxHeight,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp()
        .toBuffer()

      const outMetadata = await input.metadata()

      return {
        buffer: outBuffer,
        mimeType: "image/webp",
        width: outMetadata.width ?? 0,
        height: outMetadata.height ?? 0,
      }

      // * MARK: - Handle decoding errors
    } catch (error: any) {
      const msg = (error?.message ?? "").toString().toLowerCase()

      if (msg.includes("exceeds pixel limit")) {
        throw new BadRequestException(
          `This image is too large to process. Please upload a smaller file (max ${this.formatBytes(this.maxUploadBytes)}). ` +
            `Tip: resize or compress the image and try again.`,
        )
      }

      if (
        msg.includes("unsupported image format") ||
        msg.includes("invalid") ||
        msg.includes("corrupt")
      ) {
        throw new BadRequestException(
          "That image file looks invalid or corrupted. Please try a different file.",
        )
      }

      throw error
    }
  }

  private formatBytes(bytes: number): string {
    const mb = bytes / (1024 * 1024)
    if (mb < 1) {
      return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`
    }
    const kb = mb / 1024
    return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`
  }
}
