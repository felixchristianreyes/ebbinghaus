import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { getDeck } from "@/api/decks";
import type { Deck } from "@/api/decks/types";
import { createCard, deleteCard, getCards, updateCard } from "@/api/cards";
import type { Card, CardCreateInput, CardUpdateInput } from "@/api/cards/types";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const DeckDetailsPage = () => {
  const params = useParams();
  const deckId = useMemo(() => Number(params.deckId), [params.deckId]);

  const {
    data: deckResp,
    isLoading: loadingDeck,
    isError: isDeckError,
    error: deckError,
  } = useQuery<{ message: string; data: Deck }, Error>({
    queryKey: ["deck", deckId],
    queryFn: async () => await getDeck(deckId),
    enabled: !!deckId && !Number.isNaN(deckId),
  });

  const {
    data: cardsResp,
    isLoading: loadingCards,
    isError: isCardsError,
    error: cardsError,
  } = useQuery<
    { current_page: number; data: Card[] } | { data: Card[] },
    Error
  >({
    queryKey: ["cards", { deckId }],
    queryFn: async () => await getCards(deckId, { per_page: 100, page: 1 }),
    enabled: !!deckId && !Number.isNaN(deckId),
    placeholderData: (prev) => prev,
  });

  const deck = (deckResp?.data ?? null) as Deck | null;
  const cards = (cardsResp?.data ?? []) as Card[];
  const loading = loadingDeck || loadingCards;
  const error = isDeckError
    ? deckError?.message
    : isCardsError
    ? cardsError?.message
    : null;

  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<Card | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null);

  const CardFormSchema = z.object({
    front: z.string().min(1, "Front is required").max(2000, "Too long"),
    back: z.string().min(1, "Back is required").max(2000, "Too long"),
  });

  type CardFormData = z.infer<typeof CardFormSchema>;

  const createForm = useForm<CardFormData>({
    resolver: zodResolver(CardFormSchema),
    defaultValues: { front: "", back: "" },
  });

  const editForm = useForm<CardFormData>({
    resolver: zodResolver(CardFormSchema),
    defaultValues: { front: "", back: "" },
  });

  const { mutateAsync: createCardMutate, isPending: creating } = useMutation({
    mutationKey: ["create-card", { deckId }],
    mutationFn: async (input: CardCreateInput) =>
      await createCard(deckId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cards", { deckId }] });
    },
  });

  const { mutateAsync: updateCardMutate, isPending: updating } = useMutation({
    mutationKey: ["update-card", { deckId }],
    mutationFn: async ({ id, input }: { id: number; input: CardUpdateInput }) =>
      await updateCard(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cards", { deckId }] });
    },
  });

  const { mutateAsync: deleteCardMutate, isPending: deleting } = useMutation({
    mutationKey: ["delete-card", { deckId }],
    mutationFn: async (id: number) => await deleteCard(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cards", { deckId }] });
    },
  });

  const onSubmitCreate = async (values: CardFormData) => {
    await createCardMutate({ front: values.front, back: values.back });
    createForm.reset();
    setCreateOpen(false);
  };

  const openEdit = (card: Card) => {
    setEditTarget(card);
    editForm.reset({ front: card.front, back: card.back });
    setEditOpen(true);
  };

  const onSubmitEdit = async (values: CardFormData) => {
    if (!editTarget) return;
    await updateCardMutate({
      id: editTarget.id,
      input: { front: values.front, back: values.back },
    });
    setEditOpen(false);
  };

  const openDelete = (card: Card) => {
    setDeleteTarget(card);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{deck?.title || "Deck"}</h1>
          <p className="text-sm text-muted-foreground">
            {deck?.description || ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/study/${deckId}`}>
            <Button variant="secondary">Study</Button>
          </Link>
          <Button variant="outline">Edit Deck</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-medium">Cards ({cards.length})</h2>
          <div className="flex items-center gap-2">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button variant={"outline"}>Add Card</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add card</DialogTitle>
                  <DialogDescription>
                    Enter front and back content.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={createForm.handleSubmit(onSubmitCreate)}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="front" className="mb-1 block">
                      Front
                    </Label>
                    <Textarea id="front" {...createForm.register("front")} />
                    {createForm.formState.errors.front && (
                      <p className="mt-1 text-xs text-destructive">
                        {createForm.formState.errors.front.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="back" className="mb-1 block">
                      Back
                    </Label>
                    <Textarea id="back" {...createForm.register("back")} />
                    {createForm.formState.errors.back && (
                      <p className="mt-1 text-xs text-destructive">
                        {createForm.formState.errors.back.message}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="border-t">
          {loading && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          )}
          {error && !loading && (
            <div className="px-4 py-8 text-center text-sm text-destructive">
              {error}
            </div>
          )}
          {!loading && !error && cards.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No cards yet.
            </div>
          )}
          {!loading && !error && cards.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-accent/30">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">
                      Front
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">
                      Back
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cards.map((card) => (
                    <tr key={card.id} className="hover:bg-accent/30">
                      <td className="px-4 py-3 text-sm">{card.front}</td>
                      <td className="px-4 py-3 text-sm">{card.back}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(card)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDelete(card)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Card Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit card</DialogTitle>
            <DialogDescription>Update front/back content.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(onSubmitEdit)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="edit-front" className="mb-1 block">
                Front
              </Label>
              <Textarea id="edit-front" {...editForm.register("front")} />
              {editForm.formState.errors.front && (
                <p className="mt-1 text-xs text-destructive">
                  {editForm.formState.errors.front.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-back" className="mb-1 block">
                Back
              </Label>
              <Textarea id="edit-back" {...editForm.register("back")} />
              {editForm.formState.errors.back && (
                <p className="mt-1 text-xs text-destructive">
                  {editForm.formState.errors.back.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={updating}>
                {updating ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Card Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete card?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete the
              selected card.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteCardMutate(deleteTarget.id);
                setDeleteOpen(false);
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeckDetailsPage;
