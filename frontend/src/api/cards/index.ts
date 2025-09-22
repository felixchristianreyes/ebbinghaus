import { http } from "../client";
import type {
  Card,
  CardListQuery,
  CardListResponse,
  CardCreateInput,
  CardUpdateInput,
} from "./types";

const getCards = async (
  deckId: number,
  params?: CardListQuery
): Promise<CardListResponse> => {
  const { data } = await http.get<CardListResponse>(`/decks/${deckId}/cards`, {
    params,
  });

  return data;
};

const getCard = async (cardId: number): Promise<Card> => {
  const { data } = await http.get<Card>(`/cards/${cardId}`);
  return data;
};

const createCard = async (
  deckId: number,
  input: CardCreateInput
): Promise<Card> => {
  const { data } = await http.post<Card>(`/decks/${deckId}/cards`, input);
  return data;
};

const updateCard = async (
  cardId: number,
  input: CardUpdateInput
): Promise<Card> => {
  const { data } = await http.patch<Card>(`/cards/${cardId}`, input);
  return data;
};

const deleteCard = async (cardId: number): Promise<void> => {
  await http.delete(`/cards/${cardId}`);
};

export { getCards, getCard, createCard, updateCard, deleteCard };
