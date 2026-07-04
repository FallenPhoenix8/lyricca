import type { CoverDTO, CoverUpdateDTO } from "@shared/ts-types/cover-dto"
import { z } from "zod"

const nonEmptyString = z.string().min(1)

// Enforces that this schema perfectly implements CoverDTO
const CoverSchema: z.ZodType<CoverDTO> = z.object({
  id: z.uuid(),
  url: nonEmptyString,
  created_at: z.date(),
  updated_at: z.date(),
})

// Enforces that this schema perfectly implements CoverUpdateDTO
const CoverUpdateSchema: z.ZodType<CoverUpdateDTO> = z.object({
  url: nonEmptyString,
  song_id: z.uuid(),
})

// Infer types dynamically from the Zod schemas
type TypeCoverDTO = z.infer<typeof CoverSchema>
type TypeCoverUpdate = z.infer<typeof CoverUpdateSchema>

export type { TypeCoverDTO, TypeCoverUpdate }
export { CoverSchema, CoverUpdateSchema }
