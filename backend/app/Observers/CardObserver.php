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
        $card->review()->create([
            'next_review_date' => now(),
            'repetitions' => 0,
            'ease_factor' => 2.5,
            'interval' => 1,
            'last_reviewed_at' => null,
            'last_review_quality' => null,
        ]);
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
