import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { getDueAll, getDueForDeck, reviewCard } from "@/api/study";
import type { StudyDueAllItem, StudyDueDeckItem } from "@/api/study/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type QueueItem = StudyDueAllItem | StudyDueDeckItem;

const StudyPage = () => {
  const params = useParams();
  const deckId = useMemo(() => (params.deckId ? Number(params.deckId) : null), [params.deckId]);

  const [index, setIndex] = useState<number>(0);
  const [showBack, setShowBack] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const {
    data: queueData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<QueueItem[]>({
    queryKey: ["study-queue", { deckId }],
    queryFn: async () => (deckId ? await getDueForDeck(deckId) : await getDueAll()),
    placeholderData: (prev) => prev,
  });

  const queue = queueData ?? [];
  const current = queue[index] ?? null;
  const remaining = Math.max(queue.length - index - (current ? 1 : 0), 0);

  useEffect(() => {
    setIndex(0);
    setShowBack(false);
  }, [deckId, queueData]);

  const { mutateAsync: mutateReview, isPending: submitting, error: submitError } = useMutation({
    mutationKey: ["review", { deckId }],
    mutationFn: async ({ cardId, quality }: { cardId: number; quality: 0 | 1 | 2 | 3 | 4 | 5 }) =>
      await reviewCard(cardId, { quality }),
    onSuccess: async () => {
      setShowBack(false);
      setIndex((i) => i + 1);
      await queryClient.invalidateQueries({ queryKey: ["study-queue", { deckId }] });
    },
  });

  const handleGrade = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!current) return;
    await mutateReview({ cardId: current.id, quality });
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void refetch()} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border p-6">
        {loading && <div className="text-center text-sm text-muted-foreground">Loading...</div>}
        {(isError || submitError) && !loading && (
          <div className="text-center text-sm text-destructive">{(error as any)?.message || (submitError as any)?.message || "Something went wrong"}</div>
        )}
        {!loading && !error && !current && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No cards due. Great job!</p>
            <div className="mt-4">
              <Button onClick={() => void refetch()}>Reload</Button>
            </div>
          </div>
        )}
        {!loading && !isError && current && (
          <div className="mx-auto flex max-w-2xl flex-col items-stretch gap-6">
            <div className="rounded-md border bg-background p-6 shadow-sm">
              <p className="mb-2 text-xs uppercase text-muted-foreground">Front</p>
              <div className="whitespace-pre-wrap text-lg">{current.front}</div>
            </div>

            {showBack ? (
              <div className="rounded-md border bg-background p-6 shadow-sm">
                <p className="mb-2 text-xs uppercase text-muted-foreground">Back</p>
                <div className="whitespace-pre-wrap text-lg">{current.back}</div>
              </div>
            ) : (
              <Button onClick={() => setShowBack(true)} className="self-center">Show Answer</Button>
            )}

            {showBack && (
              <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                {[0, 1, 2, 3, 4, 5].map((q) => (
                  <Button
                    key={q}
                    variant={q <= 2 ? "destructive" : q === 3 ? "secondary" : "default"}
                    disabled={submitting}
                    onClick={() => void handleGrade(q as 0 | 1 | 2 | 3 | 4 | 5)}
                  >
                    {q}
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
