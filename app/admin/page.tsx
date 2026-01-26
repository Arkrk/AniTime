import type { Metadata } from "next";
import { getWorks } from "@/lib/get-work";
import { AdminPageContent } from "@/components/admin/AdminPageContent";

export const metadata: Metadata = {
  title: "データ管理",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 50;
  const sortColumn = (params.sortColumn as string) || "id";
  const sortDirection = (params.sortDirection as "asc" | "desc") || "desc";

  const { data: works, count } = await getWorks(page, limit, sortColumn, sortDirection);
  const pageCount = count ? Math.ceil(count / limit) : 0;

  return (
    <AdminPageContent 
      works={works} 
      pageCount={pageCount} 
    />
  );
}
