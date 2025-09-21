<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\Controller;
use App\Models\Deck;
use Illuminate\Database\QueryException;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class DeckController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        try {

            // Validate the request
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort_by' => 'nullable|string|in:title,description,created_at,updated_at',
                'sort_dir' => 'nullable|string|in:asc,desc',
                'per_page' => 'nullable|integer|min:1|max:100',
                'page' => 'nullable|integer|min:1'
            ]);

            $query = Deck::query();

            // Check for search query
            if (!empty($validated['search'])) {
                $query->where(function ($q) use ($validated) {
                    $q->where('title', 'ilike', "%{$validated['search']}%")
                        ->orWhere('description', 'ilike', "%{$validated['search']}%");
                });
            }

            // Get sorting parameters with defaults
            $sortField = $validated['sort_by'] ?? 'created_at';
            $sortDirection = $validated['sort_dir'] ?? 'desc';

            $query->orderBy($sortField, $sortDirection);

            // Get pagination with validation
            $perPage = min($validated['per_page'] ?? 10, 100); // Max 100 items per page
            $decks = $query->paginate($perPage);

            return response()->json($decks, Response::HTTP_OK);
        } catch (ValidationException $e) {
            // Handles validation errors
            return response()->json(
                [
                    'message' => 'The given data was invalid',
                    'errors' => $e->errors()
                ],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        } catch (QueryException $e) {
            // Handles database query errors
            return response()->json([
                'message' => 'Database query error',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (\Exception $e) {
            // Handles other exceptions
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
            ]);

            $deck = Deck::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
            ]);

            return response()->json([
                'message' => 'Deck created successfully',
                'data' => $deck
            ], 201);
        } catch (ValidationException $e) {
            // Handles validation errors
            return response()->json([
                'message' => 'The given data was invalid',
                'errors' => $e->errors()
            ], 422);
        } catch (QueryException $e) {
            // Handles database query errors
            return response()->json([
                'message' => 'Failed to create deck',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            // Handles other exceptions
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $deck = Deck::find($id);

            if (!$deck) {
                return response()->json([
                    'message' => 'Deck not found'
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'message' => 'Deck retrieved successfully',
                'data' => $deck
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve deck',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $deck = Deck::find($id);

            if (!$deck) {
                return response()->json([
                    'message' => 'Deck not found'
                ], Response::HTTP_NOT_FOUND);
            }

            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
            ]);

            $deck->update($validated);

            return response()->json([
                'message' => 'Deck updated successfully',
                'data' => $deck->fresh()
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'The given data was invalid',
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update deck',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            // Find the deck
            $deck = Deck::with('cards')->find($id);

            if (!$deck) {
                return response()->json([
                    'message' => 'Deck not found'
                ], Response::HTTP_NOT_FOUND);
            }

            // Delete associated cards first (if any)
            if ($deck->cards->isNotEmpty()) {
                $deck->cards()->delete();
            }

            // Delete the deck
            $deck->delete();

            return response()->json([
                'message' => 'Deck deleted successfully',
                'data' => [
                    'id' => (int)$id,
                    'deleted' => true,
                    'cards_deleted' => $deck->cards->count()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete deck',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
