<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// Import controllers
use App\Http\Controllers\Api\V1\DeckController;
use App\Http\Controllers\Api\V1\CardController;
use App\Http\Controllers\Api\V1\ReviewController;

// for v1
Route::group(['prefix' => 'v1', 'namespace' => 'App\Http\Controllers\Api\V1'], function () {
    Route::apiResource('decks', DeckController::class);
    Route::apiResource('decks.cards', CardController::class)->shallow();
    Route::apiResource('cards.reviews', ReviewController::class)->shallow();
});
