import type { CoverDTO, CoverUpdateDTO } from "@shared/ts-types/cover-dto"
import { type } from "arktype"

const CoverSchema = type({
  id: "string.uuid",
  url: "string > 0",
  created_at: "Date",
  updated_at: "Date",
})
const TCoverDTO = CoverSchema.infer satisfies CoverDTO

const CoverUpdateSchema = type({
  url: "string > 0",
  song_id: "string.uuid",
})
const TCoverUpdate = CoverUpdateSchema.infer satisfies CoverUpdateDTO

export type { TCoverDTO, TCoverUpdate }
export { CoverSchema, CoverUpdateSchema }
