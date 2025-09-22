import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist the axios instance so it exists before the mock factory executes
const mockAxiosInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

// Mock axios so that client.ts receives our mock instance
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

import { getCards } from "./index";
import type { CardListResponse } from "./types";

describe("cards API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getCards requests paginated cards with optional params", async () => {
    const deckId = 42;
    const params = { per_page: 10, page: 2 };

    const response: CardListResponse = {
      current_page: 2,
      data: [
        {
          id: 1,
          deck_id: deckId,
          front: "Q1",
          back: "A1",
          created_at: "2025-09-20T00:00:00.000Z",
          updated_at: "2025-09-20T00:00:00.000Z",
        },
      ],
      first_page_url: null,
      from: 1,
      last_page: 5,
      last_page_url: null,
      links: [],
      next_page_url: null,
      path: "/api/v1/decks/42/cards",
      per_page: 10,
      prev_page_url: null,
      to: 10,
      total: 50,
    };

    mockAxiosInstance.get.mockResolvedValueOnce({ data: response });

    const result = await getCards(deckId, params);

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      `/decks/${deckId}/cards`,
      {
        params,
      }
    );
    expect(result).toEqual(response);
  });
});
