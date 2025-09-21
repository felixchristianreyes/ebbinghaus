<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Card;
use App\Models\Deck;
use App\Services\StudyService;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\Controller;
use Illuminate\Http\JsonResponse;

class StudyController extends Controller
{
    protected $studyService;

    public function __construct(StudyService $studyService)
    {
        $this->studyService = $studyService;
    }

    /**
     * Get all cards due for review across all decks
     */
    public function dueAll(): JsonResponse
    {
        $dueCards = $this->studyService->getDueCards();
        return response()->json($dueCards);
    }

    /**
     * Get cards due for review within a specific deck
     */
    public function dueForDeck(Deck $deck): JsonResponse
    {
        $dueCards = $this->studyService->getDueCardsForDeck($deck);
        return response()->json($dueCards);
    }

    /**
     * Submit a review for a card
     */
    public function reviewCard(Request $request, Card $card): JsonResponse
    {
        $validated = $request->validate([
            'quality' => 'required|integer|min:0|max:5',
        ]);

        $review = $this->studyService->processReview($card, $validated['quality']);

        return response()->json([
            'message' => 'Review submitted successfully',
            'next_review_date' => $review->next_review_date,
            'interval' => $review->interval,
            'ease_factor' => $review->ease_factor,
            'repetitions' => $review->repetitions
        ]);
    }
}
