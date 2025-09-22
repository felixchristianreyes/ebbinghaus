import { http } from "../client";
import type {
  Deck,
  DeckCreateInput,
  DeckUpdateInput,
  DeckListQuery,
  DeckListResponse,
  DeckEntityResponse,
  DeckDeleteResponse,
} from "./types";

const getDecks = async (params?: DeckListQuery): Promise<DeckListResponse> => {
  const { data } = await http.get<DeckListResponse>("/decks", { params });
  return data;
};

const getDeck = async (id: number): Promise<DeckEntityResponse> => {
  const { data } = await http.get<DeckEntityResponse>(`/decks/${id}`);
  return data;
};

const createDeck = async (
  input: DeckCreateInput
): Promise<DeckEntityResponse> => {
  const { data } = await http.post<DeckEntityResponse>("/decks", input);
  return data;
};

const updateDeck = async (
  id: number,
  input: DeckUpdateInput
): Promise<DeckEntityResponse> => {
  const { data } = await http.patch<DeckEntityResponse>(`/decks/${id}`, input);
  return data;
};

const deleteDeck = async (id: number): Promise<DeckDeleteResponse> => {
  const { data } = await http.delete<DeckDeleteResponse>(`/decks/${id}`);
  return data;
};

export { getDecks, getDeck, createDeck, updateDeck, deleteDeck };
