<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Card;
use App\Models\Deck;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class CardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Deck $deck): JsonResponse
    {
        $cards = $deck->cards()->paginate(15);
        return response()->json($cards);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Deck $deck): JsonResponse
    {
        $validated = $request->validate([
            'front' => 'required|string|max:1000',
            'back' => 'required|string|max:1000',
        ]);

        $card = $deck->cards()->create($validated);
        
        return response()->json($card, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Card $card): JsonResponse
    {
        return response()->json($card);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Card $card): JsonResponse
    {
        $validated = $request->validate([
            'front' => 'sometimes|string|max:1000',
            'back' => 'sometimes|string|max:1000',
        ]);

        $card->update($validated);
        
        return response()->json($card);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Card $card): Response
    {
        $card->delete();
        
        return response()->noContent();
    }
}
