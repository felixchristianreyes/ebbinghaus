<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'card_id',
        'repetitions',
        'ease_factor',
        'interval',
        'next_review_date',
        'last_reviewed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'next_review_date' => 'datetime',
        'last_reviewed_at' => 'datetime',
        'ease_factor' => 'float',
    ];

    /**
     * Get the card that owns the review.
     */
    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }
}
