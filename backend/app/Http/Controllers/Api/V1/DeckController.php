<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\Controller;
use App\Models\Deck;
use Illuminate\Database\QueryException;
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

            return response()->json($decks);
        } catch (ValidationException $e) {
            // Handles validation errors
            return response()->json(
                [
                    'message' => 'The given data was invalid',
                    'errors' => $e->errors()
                ],
                422
            );
        } catch (QueryException $e) {
            // Handles database query errors
            return response()->json([
                'message' => 'Database query error',
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
