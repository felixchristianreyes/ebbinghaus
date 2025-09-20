<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// Import controllers
use App\Http\Controllers\Api\V1\DeckController;
use App\Http\Controllers\Api\V1\CardController;
use App\Http\Controllers\Api\V1\ReviewController;

Route::apiResource('decks', DeckController::class);
Route::apiResource('decks.cards', CardController::class)->shallow();
Route::apiResource('cards.reviews', ReviewController::class)->shallow();
