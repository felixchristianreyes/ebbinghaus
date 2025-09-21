<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Deck;
use App\Models\Review;
use Carbon\Carbon;

class StudyService
{
    /**
     * Get all cards due for review across all decks
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getDueCards()
    {
        return Card::whereHas('review', function ($query) {
            $query->where('next_review_date', '<=', Carbon::now())
                ->orWhereNull('next_review_date');
        })
            ->with(['review', 'deck'])
            ->get();
    }

    /**
     * Get cards due for review within a specific deck
     *
     * @param Deck $deck
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getDueCardsForDeck(Deck $deck)
    {
        return $deck->cards()
            ->whereHas('review', function ($query) {
                $query->where('next_review_date', '<=', Carbon::now())
                    ->orWhereNull('next_review_date');
            })
            ->with('review')
            ->get();
    }

    /**
     * Process a card review using the SM-2 algorithm
     *
     * @param Card $card
     * @param int $quality
     * @return Review
     */
    public function processReview(Card $card, int $quality): Review
    {
        $now = Carbon::now();
        $review = $card->review ?? new Review();

        // Initialize variables if this is the first review
        if (is_null($review->repetitions)) {
            $review->repetitions = 0; // How many times the user repeated the flashcard
            $review->ease_factor = 2.5; // Default ease factor
            $review->interval = 1; // 1 day
        }

        // SM-2 algorithm
        if ($quality >= 3) {
            // If user remembered the card (quality 3-5)
            $review->repetitions++;
            // Determine new interval based on number of repetitions
            if ($review->repetitions === 1) {
                $review->interval = 1;
            } elseif ($review->repetitions === 2) {
                $review->interval = 6;
            } else {
                // Subsequent repetitions: multiply current interval by ease factor
                $review->interval = round($review->interval * $review->ease_factor);
            }

            $review->ease_factor = max(1.3, $review->ease_factor + (0.1 - (5 - $quality) * (0.08 + (5 - $quality) * 0.02)));
        } else {
            $review->repetitions = 0;
            $review->interval = 1;
            $review->ease_factor = max(1.3, $review->ease_factor - 0.2);
        }

        $review->card_id = $card->id;
        $review->next_review_date = $now->copy()->addDays($review->interval);
        $review->last_reviewed_at = $now;
        $review->last_review_quality = $quality;

        $review->save();

        return $review;
    }
}
