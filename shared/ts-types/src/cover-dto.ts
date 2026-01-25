type CoverDTO = {
  id: string
  url: string
  created_at: Date
  updated_at: Date
}

type CoverUpdateDTO = Partial<
  Omit<CoverDTO, "id" | "created_at" | "updated_at">
>

export type { CoverDTO, CoverUpdateDTO }
