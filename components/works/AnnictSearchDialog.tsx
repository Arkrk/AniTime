"use client";

import * as React from "react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { searchAnnictWorks } from "@/lib/annict";

interface AnnictSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (workData: any) => void;
}

export function AnnictSearchDialog({ open, onOpenChange, onSelect }: AnnictSearchDialogProps) {
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<any[]>([]);
  const [isPending, startTransition] = React.useTransition();
  const [isTyping, setIsTyping] = React.useState(false);

  React.useEffect(() => {
    if (!query) {
      setData([]);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const results = await searchAnnictWorks(query);
          setData(results);
        } catch (error) {
          console.error("Failed to search Annict works:", error);
          setData([]);
        }
        setIsTyping(false);
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (work: any) => {
    onSelect({
      name: work.title,
      name_yomi: work.titleKana,
      annict_id: work.annictId,
      website_url: work.officialSiteUrl,
      x_username: work.twitterUsername,
      wikipedia_url: work.wikipediaUrl,
    });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput
          placeholder="作品タイトルで検索…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="h-75">
          {query.length > 0 && data.length === 0 && !isPending && !isTyping && (
            <CommandEmpty>作品が見つかりませんでした</CommandEmpty>
          )}
          {data.length > 0 && (
            <CommandGroup heading="Annictの作品">
              {data.map((work) => (
                <CommandItem
                  key={work.annictId}
                  value={`${work.title} ${work.titleKana || ""}`}
                  onSelect={() => handleSelect(work)}
                >
                  {work.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
