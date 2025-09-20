<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    public function deck() {
        return $this->belongsTo(Deck::class);
    }

    public function review() {
        return $this->hasOne(Review::class);
    }
}
