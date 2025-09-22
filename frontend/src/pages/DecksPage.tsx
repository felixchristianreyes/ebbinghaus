import { createDeck, deleteDeck, getDecks, updateDeck } from "@/api/decks";
import type {
  Deck,
  DeckCreateInput,
  DeckListQuery,
  DeckListResponse,
} from "@/api/decks/types";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";

type SortBy = NonNullable<DeckListQuery["sort_by"]>;
type SortDir = NonNullable<DeckListQuery["sort_dir"]>;

const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

const DeckFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Max 120 characters"),
  description: z
    .string()
    .max(500, "Max 500 characters")
    .optional()
    .or(z.literal("")),
});

type DeckFormData = z.infer<typeof DeckFormSchema>;

const DecksPage = () => {
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<Deck | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<Deck | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<
    DeckListResponse,
    Error
  >({
    queryKey: [
      "decks",
      { search: search || undefined, sortBy, sortDir, page, perPage },
    ],
    queryFn: async () =>
      await getDecks({
        search: search || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        page,
        per_page: perPage,
      }),
    placeholderData: (prev) => prev,
  });

  const decks = (data?.data ?? []) as Deck[];
  const meta = (data ?? null) as DeckListResponse | null;
  const totalPages = useMemo(() => meta?.last_page ?? 1, [meta]);

  const queryClient = useQueryClient();

  const form = useForm<DeckFormData>({
    resolver: zodResolver(DeckFormSchema),
    defaultValues: { title: "", description: "" },
  });

  const { mutateAsync: createDeckMutate, isPending: creating } = useMutation({
    mutationKey: ["create-deck"],
    mutationFn: async (input: DeckCreateInput) => await createDeck(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const onSubmitCreate = async (values: DeckFormData) => {
    await createDeckMutate({
      title: values.title,
      description: values.description ? values.description : null,
    });
    form.reset();
    setCreateOpen(false);
  };

  const editForm = useForm<DeckFormData>({
    resolver: zodResolver(DeckFormSchema),
    defaultValues: { title: "", description: "" },
  });

  const { mutateAsync: updateDeckMutate, isPending: updating } = useMutation({
    mutationKey: ["update-deck"],
    mutationFn: async ({
      id,
      input,
    }: {
      id: number;
      input: Partial<DeckCreateInput>;
    }) => await updateDeck(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const { mutateAsync: deleteDeckMutate, isPending: deleting } = useMutation({
    mutationKey: ["delete-deck"],
    mutationFn: async (id: number) => await deleteDeck(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const openEdit = (deck: Deck) => {
    setEditTarget(deck);
    editForm.reset({ title: deck.title, description: deck.description ?? "" });
    setEditOpen(true);
  };

  const onSubmitEdit = async (values: DeckFormData) => {
    if (!editTarget) return;
    await updateDeckMutate({
      id: editTarget.id,
      input: { title: values.title, description: values.description ?? null },
    });
    setEditOpen(false);
  };

  const openDelete = (deck: Deck) => {
    setDeleteTarget(deck);
    setDeleteOpen(true);
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void refetch();
  };

  const onClearSearch = () => {
    setSearch("");
    setPage(1);
    void refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Decks</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage your decks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>Create Deck</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create deck</DialogTitle>
                <DialogDescription>
                  Give your deck a title and optional description.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmitCreate)}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title" className="mb-1 block">
                    Title
                  </Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="e.g. Japanese N5"
                  />
                  {form.formState.errors.title && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description" className="mb-1 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Optional description"
                  />
                  {form.formState.errors.description && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.description.message}
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

      <div className="flex flex-col gap-3 rounded-md border p-4">
        <form
          onSubmit={onSubmitSearch}
          className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4"
        >
          <div className="flex-1">
            <Label className="mb-1 block">Search</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title or description..."
            />
          </div>
          <div>
            <Label className="mb-1 block">Sort by</Label>

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortBy)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                  <SelectItem value="created_at">Created</SelectItem>
                  <SelectItem value="updated_at">Updated</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Direction</Label>
            <Select
              value={sortDir}
              onValueChange={(value) => setSortDir(value as SortDir)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a sort direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Per page</Label>
            <Select
              value={perPage.toString()}
              onValueChange={(value) => {
                setPerPage(parseInt(value, 10));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Search</Button>
            {search && (
              <Button type="button" variant="ghost" onClick={onClearSearch}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table className="min-w-full">
          <TableHeader className="bg-accent/30">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Loading decks...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-destructive"
                >
                  {error?.message || "Failed to load decks"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && decks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No decks found.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              !isError &&
              decks.map((deck) => (
                <TableRow key={deck.id}>
                  <TableCell>
                    <Link
                      to={`/decks/${deck.id}`}
                      className="font-medium hover:underline"
                    >
                      {deck.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {deck.description || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(deck.created_at)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(deck.updated_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link to={`/study/${deck.id}`}>
                        <Button size="sm" variant="secondary">
                          Study
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(deck)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDelete(deck)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {meta?.current_page ?? page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Deck Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit deck</DialogTitle>
            <DialogDescription>Update title or description.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(onSubmitEdit)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="edit-title" className="mb-1 block">
                Title
              </Label>
              <Input id="edit-title" {...editForm.register("title")} />
              {editForm.formState.errors.title && (
                <p className="mt-1 text-xs text-destructive">
                  {editForm.formState.errors.title.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-description" className="mb-1 block">
                Description
              </Label>
              <Textarea
                id="edit-description"
                {...editForm.register("description")}
              />
              {editForm.formState.errors.description && (
                <p className="mt-1 text-xs text-destructive">
                  {editForm.formState.errors.description.message}
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

      {/* Delete Deck Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete deck?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete the deck
              {deleteTarget ? ` "${deleteTarget.title}"` : ""} and its cards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteDeckMutate(deleteTarget.id);
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

export default DecksPage;
