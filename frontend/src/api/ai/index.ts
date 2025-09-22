import { z } from "zod";
import { http } from "../client";

export const AiGeneratedCardSchema = z.object({
  front: z.string().min(1).max(1000),
  back: z.string().min(1).max(1000),
});

export const AiGeneratedDeckSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  cards: z.array(AiGeneratedCardSchema).min(1).max(50),
});

export type AiGeneratedCard = z.infer<typeof AiGeneratedCardSchema>;
export type AiGeneratedDeck = z.infer<typeof AiGeneratedDeckSchema>;

export type GenerateDeckInput = {
  prompt: string;
  num_cards?: number;
  difficulty?: "easy" | "medium" | "hard";
  language?: string;
};

export const generateDeckWithAI = async (
  input: GenerateDeckInput
): Promise<AiGeneratedDeck> => {
  const { data } = await http.post<{ message: string; data: unknown }>(
    "/ai/generate-deck",
    input
  );

  const parsed = AiGeneratedDeckSchema.safeParse((data as any).data);
  if (!parsed.success) {
    throw new Error("Invalid AI response");
  }
  return parsed.data;
};


