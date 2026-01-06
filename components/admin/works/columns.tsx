"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Database } from "@/types/supabase";
import { WorkEditor } from "@/components/works/WorkEditor";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";

export type Work = Database["public"]["Tables"]["works"]["Row"];

export const columns: ColumnDef<Work>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          タイトル
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const work = row.original;
      return (
        <Link
          href={`/works/${work.id}`}
          className="hover:underline font-medium"
        >
          {work.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "website_url",
    header: "公式サイト",
    cell: ({ row }) => {
      const url = row.getValue("website_url") as string;
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline truncate max-w-50 block"
        >
          {url}
        </a>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "x_username",
    header: "X",
    cell: ({ row }) => {
      const username = row.getValue("x_username") as string;
      return username ? (
        <a
          href={`https://x.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          @{username}
        </a>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "wikipedia_url",
    header: "Wikipedia",
    cell: ({ row }) => {
      const url = row.getValue("wikipedia_url") as string;
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline truncate max-w-50 block"
        >
          Link
        </a>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "annict_url",
    header: "Annict",
    cell: ({ row }) => {
      const url = row.getValue("annict_url") as string;
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline truncate max-w-50 block"
        >
          Link
        </a>
      ) : (
        "-"
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const work = row.original;
      return <WorkEditor work={work} />;
    },
  },
];
