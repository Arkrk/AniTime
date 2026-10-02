"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DAYS, getDayString } from "@/lib/format-days";

type DayTabsProps = {
  currentDay?: number;
  value?: string;
  onValueChange?: (value: string) => void;
  forceTabs?: boolean;
  className?: string;
};

export const DayTabs: React.FC<DayTabsProps> = ({ currentDay = 1, value, onValueChange, forceTabs, className }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleValueChange = (val: string) => {
    if (onValueChange) {
      onValueChange(val);
      return;
    }
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("day", val);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("loading-start", { detail: newParams.toString() }));
    }
    router.push(`/?${newParams.toString()}`, { scroll: false });
  };

  const selectedValue = value !== undefined ? value : getDayString(currentDay);

  const renderTabs = () => (
    <Tabs
      defaultValue={selectedValue}
      value={selectedValue}
      onValueChange={handleValueChange}
      className={className || "w-fit"}
    >
      <TabsList className={className === "w-full" ? "w-full justify-between" : ""}>
        {DAYS.map((d) => (
          <TabsTrigger 
            key={d.id} 
            value={d.en.toLowerCase()}
            className={className === "w-full" ? "w-full" : ""}
          >
            {d.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );

  if (!isMounted) {
    return (
      <div className={forceTabs ? "block" : "hidden sm:block"}>
        {renderTabs()}
      </div>
    );
  }

  if (forceTabs) {
    return (
      <div className="block">
        {renderTabs()}
      </div>
    );
  }

  return (
    <>
      {/* モバイルサイズではSelect */}
      <div className="block sm:hidden">
        <Select value={selectedValue} onValueChange={handleValueChange}>
          <SelectTrigger className={className}>
            <SelectValue placeholder="曜日を選択" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              {DAYS.map((d) => (
                <SelectItem key={d.id} value={d.en.toLowerCase()}>
                  {d.label}曜
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* デスクトップサイズではTabs */}
      <div className="hidden sm:block">
        {renderTabs()}
      </div>
    </>
  );
};