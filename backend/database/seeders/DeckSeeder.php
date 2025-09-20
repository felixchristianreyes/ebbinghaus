<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Deck;

class DeckSeeder extends Seeder
{
    public function run()
    {
        Deck::factory()->count(10)->create();
    }
}
