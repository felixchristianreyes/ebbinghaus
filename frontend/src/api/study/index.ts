import { http } from "../client";
import type {
  StudyDueAllItem,
  StudyDueDeckItem,
  StudyReviewInput,
  StudyReviewResponse,
} from "./types";

const getDueAll = async (): Promise<StudyDueAllItem[]> => {
  const { data } = await http.get<StudyDueAllItem[]>("/study/due");
  return data;
};

const getDueForDeck = async (deckId: number): Promise<StudyDueDeckItem[]> => {
  const { data } = await http.get<StudyDueDeckItem[]>(`/study/due/${deckId}`);
  return data;
};

const reviewCard = async (
  cardId: number,
  input: StudyReviewInput
): Promise<StudyReviewResponse> => {
  const { data } = await http.post<StudyReviewResponse>(
    `/study/review/${cardId}`,
    input
  );
  return data;
};

export { getDueAll, getDueForDeck, reviewCard };
