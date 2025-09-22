import type { Deck } from "@/api/decks/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

type DeckCardProps = {
  deck: Deck;
  onEdit?: (deck: Deck) => void;
  onDelete?: (deck: Deck) => void;
};

export default function DeckCard({ deck, onEdit, onDelete }: DeckCardProps) {
  return (
    <div className="relative">
      {/* stack shadows */}
      <div className="pointer-events-none absolute inset-0 -z-10 -rotate-2 translate-x-2 translate-y-2 rounded-xl border bg-card shadow-sm" />
      <div className="pointer-events-none absolute inset-0 -z-10 rotate-2 -translate-x-1 -translate-y-1 rounded-xl border bg-card shadow-sm" />

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-tight">
              {deck.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {deck.description || "No description"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <Link
            to={`/decks/${deck.id}`}
            className="font-medium hover:underline"
          >
            Open deck
          </Link>
          <div className="flex items-center gap-2">
            <Link to={`/study/${deck.id}`}>
              <Button
                size="sm"
                variant="ghost"
                className="bg-green-300 hover:bg-green-400"
              >
                Study
              </Button>
            </Link>
            {onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(deck)}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(deck)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
