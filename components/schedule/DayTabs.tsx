"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DAYS } from "@/lib/get-schedule";

type DayTabsProps = {
  currentDay: number;
};

export const DayTabs: React.FC<DayTabsProps> = ({ currentDay }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleValueChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("day", value);
    router.push(`/?${newParams.toString()}`, { scroll: false });
  };

  return (
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
  );
};