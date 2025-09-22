<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
    /**
     * Generate a deck with cards from a natural language prompt using OpenAI.
     */
    public function generateDeck(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => 'required|string|max:4000',
            'num_cards' => 'sometimes|integer|min:1|max:50',
            'difficulty' => 'sometimes|string|in:easy,medium,hard',
        ]);

        $apiKey = env('OPENAI_API_KEY');
        if (!$apiKey) {
            return response()->json([
                'message' => 'OPENAI_API_KEY is not configured on the server.',
            ], 500);
        }

        $numCards = (int)($validated['num_cards'] ?? 15);
        $difficulty = $validated['difficulty'] ?? 'medium';
        $language = $validated['language'] ?? 'en';
        $userPrompt = $validated['prompt'];

        $schema = [
            'type' => 'object',
            'properties' => [
                'title' => ['type' => 'string'],
                'description' => ['type' => ['string', 'null']],
                'cards' => [
                    'type' => 'array',
                    'minItems' => 1,
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'front' => ['type' => 'string'],
                            'back' => ['type' => 'string'],
                        ],
                        'required' => ['front', 'back'],
                        'additionalProperties' => false,
                    ],
                ],
            ],
            'required' => ['title', 'cards'],
            'additionalProperties' => false,
        ];

        $system = "You generate flashcard decks as strict JSON. Output MUST be a single JSON object matching the provided JSON Schema. Use the requested language. Avoid markdown, quotes, or any extra text outside JSON.";
        $instruction = "Create a flashcard deck based on the user's prompt. Include around {$numCards} cards, difficulty {$difficulty}, in language {$language}.";

        try {
            $response = Http::withToken($apiKey)
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'temperature' => 0.4,
                    'response_format' => [ 'type' => 'json_object' ],
                    'messages' => [
                        [ 'role' => 'system', 'content' => $system ],
                        [ 'role' => 'user', 'content' => $instruction . "\n\nUser prompt: " . $userPrompt . "\n\nJSON Schema: " . json_encode($schema) ],
                    ],
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'AI provider error',
                    'error' => $response->json(),
                ], 502);
            }

            $choice = data_get($response->json(), 'choices.0.message.content');
            if (!is_string($choice) || $choice === '') {
                return response()->json([
                    'message' => 'AI returned an empty response',
                ], 502);
            }

            $json = json_decode($choice, true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($json)) {
                return response()->json([
                    'message' => 'Failed to parse AI JSON output',
                ], 502);
            }

            // Basic shape enforcement
            $title = $json['title'] ?? null;
            $cards = $json['cards'] ?? [];
            if (!is_string($title) || !is_array($cards) || count($cards) === 0) {
                return response()->json([
                    'message' => 'AI output missing required fields',
                ], 502);
            }

            // Trim to requested size if needed
            if (count($cards) > $numCards) {
                $cards = array_slice($cards, 0, $numCards);
                $json['cards'] = $cards;
            }

            return response()->json([
                'message' => 'ok',
                'data' => $json,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Unexpected server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}


