"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DAYS } from "@/lib/get-schedule";

type DayTabsProps = {
  currentDay: number;
};

export const DayTabs: React.FC<DayTabsProps> = ({ currentDay }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleValueChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("day", value);
    router.push(`/?${newParams.toString()}`, { scroll: false });
  };

  if (!isMounted) {
    return (
      <div className="hidden sm:block">
        <Tabs
          defaultValue={currentDay.toString()}
          value={currentDay.toString()}
          onValueChange={handleValueChange}
          className="w-fit"
        >
          <TabsList>
            {DAYS.map((d) => (
              <TabsTrigger key={d.id} value={d.id.toString()}>
                {d.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    );
  }

  return (
    <>
      {/* モバイルサイズではSelect */}
      <div className="block sm:hidden">
        <Select value={currentDay.toString()} onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="曜日を選択" />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.label}曜日
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* デスクトップサイズではTabs */}
      <div className="hidden sm:block">
        <Tabs
          defaultValue={currentDay.toString()}
          value={currentDay.toString()}
          onValueChange={handleValueChange}
          className="w-fit"
        >
          <TabsList>
            {DAYS.map((d) => (
              <TabsTrigger key={d.id} value={d.id.toString()}>
                {d.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </>
  );
};