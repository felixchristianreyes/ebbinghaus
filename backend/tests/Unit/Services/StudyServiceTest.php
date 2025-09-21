<?php

namespace Tests\Unit\Services;

use App\Models\Card;
use App\Models\Review;
use App\Models\Deck;
use App\Services\StudyService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class StudyServiceTest extends TestCase
{

    protected StudyService $studyService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->studyService = new StudyService();
        Carbon::setTestNow(now());
        \Illuminate\Support\Facades\Log::setDefaultDriver('stderr'); // Add this line
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        Carbon::setTestNow();
    }

    /** @test */
    public function it_processes_first_review_correctly()
    {
        // Create a deck first
        $deck = Deck::factory()->create();

        // Create a card that belongs to the deck
        $card = Card::factory()->create([
            'deck_id' => $deck->id
        ]);

        $quality = 5; // Great response

        $review = $this->studyService->processReview($card, $quality);

        // Assertions
        $this->assertInstanceOf(Review::class, $review); // should be instance of Review
        $this->assertEquals(1, $review->repetitions); // should be 1
        $this->assertGreaterThan(2.5, $review->ease_factor); // Ease factor should increase
        $this->assertEquals(1, $review->interval); // should be 1
        $this->assertEquals(now()->addDay()->toDateString(), $review->next_review_date->toDateString()); // should be today + 1 day
        $this->assertEquals($quality, $review->last_review_quality); // should be 5

    }
}
