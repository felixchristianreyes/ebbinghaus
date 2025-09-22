import type { Card } from '@/api/cards/types'
import type { Deck } from '@/api/decks/types'

export type Review = {
  id: number
  card_id: number
  repetitions: number
  ease_factor: number
  interval: number
  next_review_date: string | null
  last_reviewed_at: string | null
  last_review_quality: number | null
  created_at: string
  updated_at: string
}

export type StudyDueAllItem = Card & { review: Review | null; deck: Deck }
export type StudyDueDeckItem = Card & { review: Review | null }

export type StudyReviewInput = { quality: 0 | 1 | 2 | 3 | 4 | 5 }

export type StudyReviewResponse = {
  message: string
  next_review_date: string
  interval: number
  ease_factor: number
  repetitions: number
}


