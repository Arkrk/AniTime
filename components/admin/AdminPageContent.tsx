"use client";

import { useLogin } from "@/hooks/login";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/works/data-table";
import { columns } from "@/components/admin/works/columns";
import { Database } from "@/types/supabase";

type Work = Database["public"]["Tables"]["works"]["Row"];

interface AdminPageContentProps {
  works: Work[];
  pageCount: number;
}

export function AdminPageContent({ works, pageCount }: AdminPageContentProps) {
  const { user, loading } = useLogin();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("works");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/");
    }
  }, [mounted, user, loading, router]);

  if (!mounted || loading || !user) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="shrink-0 p-4 border-b bg-white z-10 sticky top-0">
        <div className="flex items-center justify-center sm:justify-between gap-4">
          <div className="hidden sm:flex items-center gap-4">
            <h1 className="text-lg font-bold">データ管理</h1>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="works">作品</TabsTrigger>
              <TabsTrigger value="areas_channels">チャンネル</TabsTrigger>
              <TabsTrigger value="seasons">クール</TabsTrigger>
              <TabsTrigger value="tags">タグ</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto m-0">
        {activeTab === "works" && (
          <div className="h-full">
            <DataTable columns={columns} data={works} pageCount={pageCount} />
          </div>
        )}
        {activeTab === "areas_channels" && (
          <div className="p-4 md:p-8 py-4">準備中</div>
        )}
        {activeTab === "seasons" && (
          <div className="p-4 md:p-8 py-4">準備中</div>
        )}
        {activeTab === "tags" && (
          <div className="p-4 md:p-8 py-4">準備中</div>
        )}
      </div>
    </div>
  );
}
