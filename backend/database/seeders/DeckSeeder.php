<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Deck;

class DeckSeeder extends Seeder
{
    public function run()
    {
        Deck::factory()->count(10)->create();
        // Create 2 decks without descriptions
        Deck::factory()->count(2)
            ->withoutDescription()
            ->create();
    }
}
