"use client";

import { useState, useEffect } from "react";
import { useLogin } from "@/hooks/login";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkEditor } from "@/components/works/WorkEditor";

export function AddWorkButton() {
  const { user } = useLogin();
  const [mounted, setMounted] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) {
    return null;
  }

  return (
    <>
      <Button variant="default" size="icon" onClick={() => setCreateOpen(true)}>
        <Plus />
      </Button>
      <WorkEditor open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
