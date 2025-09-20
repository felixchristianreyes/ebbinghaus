<?php

namespace App\Observers;

use App\Models\Card;

class CardObserver
{
    /**
     * Handle the Card "created" event.
     */
    public function created(Card $card): void
    {
        $card->reviews()->create(
            [
                'next_review_at' => now()->addDays(1),
                'interval_days' => 1,
                'last_review_at' => now(),
                'last_review_quality' => 3,
            ]
        );
    }

    /**
     * Handle the Card "updated" event.
     */
    // public function updated(Card $card): void
    // {
    //     //
    // }

    /**
     * Handle the Card "deleted" event.
     */
    // public function deleted(Card $card): void
    // {
    //     //
    // }

    /**
     * Handle the Card "restored" event.
     */
    // public function restored(Card $card): void
    // {
    //     //
    // }

    /**
     * Handle the Card "force deleted" event.
     */
    // public function forceDeleted(Card $card): void
    // {
    //     //
    // }
}
