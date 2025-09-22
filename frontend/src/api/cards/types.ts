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

export type Card = {
  id: number
  deck_id: number
  front: string
  back: string
  created_at: string
  updated_at: string
}

export type CardListQuery = {
  per_page?: number
  page?: number
}

export type CardListResponse = Paginated<Card>

export type CardCreateInput = { front: string; back: string }
export type CardUpdateInput = { front?: string; back?: string }


