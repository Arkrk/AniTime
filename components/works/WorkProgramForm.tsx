import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Database } from "@/types/supabase";
import { DAYS } from "@/lib/get-schedule";
import { getProgramColorClass } from "@/lib/schedule-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetFooter } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { ChannelSelect } from "@/components/schedule/ChannelSelect";

type Program = Database["public"]["Tables"]["programs"]["Row"] & {
  programs_seasons?: { season_id: number }[];
  programs_tags?: { tag_id: number }[];
};
type Channel = Database["public"]["Tables"]["channels"]["Row"] & {
  areas: { id: number; name: string; order: number } | null;
};
type Tag = Database["public"]["Tables"]["tags"]["Row"];
type Season = Database["public"]["Tables"]["seasons"]["Row"];

interface WorkProgramFormProps {
  initialData?: Partial<Program>;
  channels: Channel[];
  tags: Tag[];
  seasons: Season[];
  onSubmit: (data: any) => Promise<void> | void;
  onCancel: () => void;
}

export function WorkProgramForm({ initialData, channels, tags, seasons, onSubmit, onCancel }: WorkProgramFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [skipUpdateTimestamp, setSkipUpdateTimestamp] = useState(false);
  const [formData, setFormData] = useState({
    channel_id: 0,
    day_of_the_week: 1,
    start_date: "",
    start_time: "",
    end_time: "",
    color: 1,
    version: "",
    note: "",
    ...initialData,
    season_ids: initialData?.programs_seasons?.map(ps => ps.season_id) || [],
    tag_ids: initialData?.programs_tags?.map(pt => pt.tag_id) || [],
  });

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSeasonToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      season_ids: prev.season_ids.includes(id)
        ? prev.season_ids.filter(sid => sid !== id)
        : [...prev.season_ids, id]
    }));
  };

  const handleTagToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(id)
        ? prev.tag_ids.filter(tid => tid !== id)
        : [...prev.tag_ids, id]
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({
        ...formData,
        start_date: formData.start_date || null,
        skipUpdateTimestamp,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="channel_id">チャンネル</FieldLabel>
            <ChannelSelect
              channels={channels}
              value={formData.channel_id}
              onValueChange={(val) => handleChange("channel_id", val)}
              className="w-full"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="day_of_the_week">曜日</FieldLabel>
            <Select 
              value={formData.day_of_the_week?.toString()} 
              onValueChange={(val) => handleChange("day_of_the_week", Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="曜日を選択" />
              </SelectTrigger>
              <SelectContent position="popper">
                {DAYS.map(day => (
                  <SelectItem key={day.id} value={day.id.toString()}>
                    {day.label}曜
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="start_date">開始日</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !formData.start_date && "text-muted-foreground"
                  )}
                >
                  {formData.start_date ? (
                    format(new Date(formData.start_date), "y年M月d日", { locale: ja })
                  ) : (
                    <span>日付を選択</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.start_date ? new Date(formData.start_date) : undefined}
                  onSelect={(date) => handleChange("start_date", date ? format(date, "yyyy-MM-dd") : "")}
                  locale={ja}
                />
              </PopoverContent>
            </Popover>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="start_time">開始時間</FieldLabel>
            <Input 
              id="start_time" 
              type="time" 
              value={formData.start_time || ""} 
              onChange={(e) => handleChange("start_time", e.target.value)}
              required
              className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="end_time">終了時間</FieldLabel>
            <Input 
              id="end_time" 
              type="time" 
              value={formData.end_time || ""} 
              onChange={(e) => handleChange("end_time", e.target.value)}
              required
              className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </Field>
        </div>

      <Field>
        <FieldLabel htmlFor="color">背景色</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(color => (
            <button
              key={color}
              type="button"
              onClick={() => handleChange("color", color)}
              className={`w-8 h-8 rounded-full border-2 ${getProgramColorClass(color)} ${formData.color === color ? "ring-2 ring-offset-2 ring-black" : ""}`}
            />
          ))}
        </div>
      </Field>

      <Field>
        <FieldLabel>放送クール</FieldLabel>
        <ScrollArea className="h-40 border rounded-md">
          <div className="p-3 flex flex-wrap gap-2">
            {seasons.map(season => (
              <Toggle
                key={season.id}
                variant="outline"
                size="default"
                pressed={formData.season_ids.includes(season.id)}
                onPressedChange={() => handleSeasonToggle(season.id)}
              >
                {season.year}年{season.month}月
              </Toggle>
            ))}
          </div>
        </ScrollArea>
      </Field>

      <Field>
        <FieldLabel>タグ</FieldLabel>
        <ScrollArea className="h-40 border rounded-md">
          <div className="p-3 flex flex-wrap gap-2">
            {tags.map(tag => (
              <Toggle
                key={tag.id}
                variant="outline"
                size="default"
                pressed={formData.tag_ids.includes(tag.id)}
                onPressedChange={() => handleTagToggle(tag.id)}
              >
                {tag.name}
              </Toggle>
            ))}
          </div>
        </ScrollArea>
      </Field>

      <Field>
        <FieldLabel htmlFor="version">バージョン</FieldLabel>
        <Input 
          id="version" 
          value={formData.version || ""} 
          onChange={(e) => handleChange("version", e.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="note">備考</FieldLabel>
        <Textarea 
          id="note" 
          value={formData.note || ""} 
          onChange={(e) => handleChange("note", e.target.value)}
        />
      </Field>
      </div>

      <SheetFooter>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-2">
            <Globe className={cn("h-4 w-4 transition-colors", !skipUpdateTimestamp ? "text-foreground" : "text-muted-foreground")} />
            <Switch
              id="skip-update-timestamp"
              checked={skipUpdateTimestamp}
              onCheckedChange={setSkipUpdateTimestamp}
            />
            <Lock className={cn("h-4 w-4 transition-colors", skipUpdateTimestamp ? "text-foreground" : "text-muted-foreground")} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Spinner className="mr-2" />}
              {initialData?.id ? "保存" : "追加"}
            </Button>
          </div>
        </div>
      </SheetFooter>
    </form>
  );
}
