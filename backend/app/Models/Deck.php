<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deck extends Model
{
    public function card() {
        return $this->hasMany(Card::class);
    }
}
