import { getDueAll, getDueForDeck, reviewCard } from "@/api/study";
import type { StudyDueAllItem, StudyDueDeckItem } from "@/api/study/types";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

type QueueItem = StudyDueAllItem | StudyDueDeckItem;

const StudyPage = () => {
  const params = useParams();
  const deckId = useMemo(
    () => (params.deckId ? Number(params.deckId) : null),
    [params.deckId]
  );

  const [index, setIndex] = useState<number>(0);
  const [showBack, setShowBack] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const {
    data: queueData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<QueueItem[], Error>({
    queryKey: ["study-queue", { deckId }],
    queryFn: async () =>
      deckId ? await getDueForDeck(deckId) : await getDueAll(),
    placeholderData: (prev) => prev,
  });

  const queue = queueData ?? [];
  const current = queue[index] ?? null;
  const remaining = Math.max(queue.length - index - (current ? 1 : 0), 0);

  useEffect(() => {
    setIndex(0);
    setShowBack(false);
  }, [deckId, queueData]);

  const {
    mutateAsync: mutateReview,
    isPending: submitting,
    error: submitError,
  } = useMutation({
    mutationKey: ["review", { deckId }],
    mutationFn: async ({
      cardId,
      quality,
    }: {
      cardId: number;
      quality: 0 | 1 | 2 | 3 | 4 | 5;
    }) => await reviewCard(cardId, { quality }),
    onSuccess: async () => {
      setShowBack(false);
      setIndex((i) => i + 1);
      await queryClient.invalidateQueries({
        queryKey: ["study-queue", { deckId }],
      });
    },
  });

  const handleGrade = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!current) return;
    await mutateReview({ cardId: current.id, quality });
  };

  const getErrorMessage = (e: unknown): string | null => {
    if (!e) return null;
    if (typeof e === "string") return e;
    if (e instanceof Error) return e.message;
    if (typeof e === "object" && "message" in e) {
      const m = (e as { message?: unknown }).message;
      return typeof m === "string" ? m : null;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Study</h1>
          <p className="text-sm text-muted-foreground">
            {deckId ? `Deck #${deckId}` : "All decks"} • {queue.length} due
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        {loading && (
          <div className="text-center text-sm text-muted-foreground">
            Loading...
          </div>
        )}
        {(isError || submitError) && !loading && (
          <div className="text-center text-sm text-destructive">
            {getErrorMessage(error) ||
              getErrorMessage(submitError) ||
              "Something went wrong"}
          </div>
        )}
        {!loading && !error && !current && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No cards due. Great job!
            </p>
            <div className="mt-4">
              <Button onClick={() => void refetch()}>Reload</Button>
            </div>
          </div>
        )}
        {!loading && !isError && current && (
          <div className="mx-auto flex max-w-2xl flex-col items-stretch gap-6">
            <div className="self-stretch">
              <div className="[perspective:1000px]">
                <button
                  type="button"
                  onClick={() => setShowBack((v) => !v)}
                  className="relative block w-full focus:outline-none"
                >
                  <div
                    className={`relative h-72 w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                      showBack ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    <div className="absolute inset-0 rounded-xl border bg-card p-6 shadow-sm [backface-visibility:hidden]">
                      <div className="flex justify-center items-center h-full whitespace-pre-wrap text-lg">
                        {current.front}
                      </div>
                    </div>
                    <div className="bg-cyan-200 absolute inset-0 rounded-xl border p-6 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div className="flex justify-center items-center h-full whitespace-pre-wrap text-lg">
                        {showBack && current.back}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {showBack && (
              <div className="flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  How well did you remember this card? 0 = didn't know, 5 = knew
                  it perfectly
                </p>
              </div>
            )}
            {showBack && (
              <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                {[0, 1, 2, 3, 4, 5].map((quality) => (
                  <Button
                    key={quality}
                    variant="outline"
                    disabled={submitting}
                    onClick={() =>
                      void handleGrade(quality as 0 | 1 | 2 | 3 | 4 | 5)
                    }
                  >
                    {quality}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Card {index + (current ? 1 : 0)} of {queue.length}
              </span>
              <span>{remaining} remaining</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPage;
