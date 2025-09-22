export type Nullable<T> = T | null

export type Paginated<T> = {
  current_page: number
  data: T[]
  first_page_url: Nullable<string>
  from: Nullable<number>
  last_page: number
  last_page_url: Nullable<string>
  links: Array<{ url: Nullable<string>; label: string; active: boolean }>
  next_page_url: Nullable<string>
  path: string
  per_page: number
  prev_page_url: Nullable<string>
  to: Nullable<number>
  total: number
}

export type ValidationErrors = Record<string, string[]>

export type ValidationErrorResponse = {
  message: string
  errors: ValidationErrors
}

export type GenericErrorResponse = {
  message: string
  error?: string
}

export type Deck = {
  id: number
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

export type DeckListQuery = {
  search?: string
  sort_by?: 'title' | 'description' | 'created_at' | 'updated_at'
  sort_dir?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

export type DeckListResponse = Paginated<Deck>

export type DeckCreateInput = {
  title: string
  description?: string | null
}

export type DeckUpdateInput = {
  title?: string
  description?: string | null
}

export type DeckEntityResponse = { message: string; data: Deck }

export type DeckDeleteResponse = {
  message: string
  data: { id: number; deleted: boolean; cards_deleted: number }
}


