"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  data: unknown;
}

interface Props {
  title: string;
  placeholder: string;
  onSelect: (item: unknown) => void;
  onInvite?: () => void;
  inviteComponent?: (closeParent: () => void) => React.ReactNode;
  searchFn: (term: string) => Promise<SearchResult[]>;
  inviteLabel?: string;
  trigger?: React.ReactElement;
}

export function SearchSelectDialog({
  title,
  placeholder,
  onSelect,
  onInvite,
  inviteComponent,
  searchFn,
  inviteLabel = "Invite New",
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await searchFn(searchTerm);
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, open, searchFn]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm("");
      setResults([]);
    }
  };

  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger || (
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search...
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.data);
                    setOpen(false);
                  }}
                  className="group w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))
            ) : searchTerm.length > 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results found for &ldquo;{searchTerm}&rdquo;
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Type to start searching...
              </div>
            )}
          </div>

          {/* Always show invite option at the bottom */}
          {(inviteComponent || onInvite) && (
            <div className="border-t pt-4">
              {inviteComponent ? (
                <div>{inviteComponent(close)}</div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => {
                    onInvite?.();
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {inviteLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
