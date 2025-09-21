<?php

use Illuminate\Support\Facades\Route;
// Import controllers
use App\Http\Controllers\Api\V1\DeckController;
use App\Http\Controllers\Api\V1\CardController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\StudyController;

// for v1
Route::group(['prefix' => 'v1', 'namespace' => 'App\Http\Controllers\Api\V1'], function () {
    // Deck and card management
    Route::apiResource('decks', DeckController::class);
    Route::apiResource('decks.cards', CardController::class)->shallow();
    
    // Study routes
    Route::get('/study/due', [StudyController::class, 'dueAll']);
    Route::get('/study/due/{deck}', [StudyController::class, 'dueForDeck']);
    Route::post('/study/review/{card}', [StudyController::class, 'reviewCard']);
});
