import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Database } from "@/types/supabase";
import { DAYS } from "@/lib/get-schedule";
import { getProgramColorClass } from "@/lib/schedule-utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function WorkProgramForm({ initialData, channels, tags, seasons, onSubmit, onCancel }: WorkProgramFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Group channels by area
  const channelsByArea = channels.reduce((acc, channel) => {
    const areaName = channel.areas?.name || "その他";
    if (!acc[areaName]) acc[areaName] = [];
    acc[areaName].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="channel_id">チャンネル</Label>
          <Select 
            value={formData.channel_id ? formData.channel_id.toString() : ""} 
            onValueChange={(val) => handleChange("channel_id", Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="チャンネルを選択" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(channelsByArea).map(([area, areaChannels]) => (
                <div key={area}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                    {area}
                  </div>
                  {areaChannels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id.toString()}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="day_of_the_week">曜日</Label>
          <Select 
            value={formData.day_of_the_week?.toString()} 
            onValueChange={(val) => handleChange("day_of_the_week", Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="曜日を選択" />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map(day => (
                <SelectItem key={day.id} value={day.id.toString()}>
                  {day.label}曜日
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex flex-col">
          <Label htmlFor="start_date">開始日</Label>
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
                  format(new Date(formData.start_date), "yyyy年MM月dd日", { locale: ja })
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
                initialFocus
                locale={ja}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">色</Label>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_time">開始時間</Label>
          <Input 
            id="start_time" 
            type="time" 
            value={formData.start_time || ""} 
            onChange={(e) => handleChange("start_time", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">終了時間</Label>
          <Input 
            id="end_time" 
            type="time" 
            value={formData.end_time || ""} 
            onChange={(e) => handleChange("end_time", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>放送クール</Label>
        <ScrollArea className="h-32 border rounded-md p-2">
          <div className="grid grid-cols-2 gap-2">
            {seasons.map(season => (
              <div key={season.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`season-${season.id}`} 
                  checked={formData.season_ids.includes(season.id)}
                  onCheckedChange={() => handleSeasonToggle(season.id)}
                />
                <label htmlFor={`season-${season.id}`} className="text-sm cursor-pointer">
                  {season.name}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <Label>タグ</Label>
        <ScrollArea className="h-32 border rounded-md p-2">
          <div className="grid grid-cols-2 gap-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`tag-${tag.id}`} 
                  checked={formData.tag_ids.includes(tag.id)}
                  onCheckedChange={() => handleTagToggle(tag.id)}
                />
                <label htmlFor={`tag-${tag.id}`} className="text-sm cursor-pointer">
                  {tag.name}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <Label htmlFor="version">バージョン (任意)</Label>
        <Input 
          id="version" 
          value={formData.version || ""} 
          onChange={(e) => handleChange("version", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">備考 (任意)</Label>
        <Textarea 
          id="note" 
          value={formData.note || ""} 
          onChange={(e) => handleChange("note", e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  );
}
