"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export function DateTimePicker24h({
  date,
  onChange,
}: {
  date: Date | undefined;
  onChange?: (dateTime: Date) => void;
}) {
  const [dateTime, setDateTime] = React.useState<Date>();
  const [isOpen, setIsOpen] = React.useState(false);

  // limitDateが変更されたときに更新
  React.useEffect(() => {
    if (date) {
      setDateTime(new Date(date));
    }
  }, [date]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentHours = date?.getHours() ?? 0;
      const currentMinutes = date?.getMinutes() ?? 0;

      selectedDate.setHours(currentHours);
      selectedDate.setMinutes(currentMinutes);

      setDateTime(selectedDate);
      onChange?.(selectedDate);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    setDateTime((prevDate) => {
      if (prevDate) {
        const newDate = new Date(prevDate);
        if (type === "hour") {
          newDate.setHours(parseInt(value, 10));
        } else if (type === "minute") {
          newDate.setMinutes(parseInt(value, 10));
        }
        onChange?.(newDate); // 親コンポーネントに通知
        return newDate;
      }
      return prevDate;
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal cursor-pointer focus:outline focus:outline-[#79BD9A]",
            !dateTime && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateTime ? (
            format(dateTime, "yyyy/MM/dd HH:mm")
          ) : (
            <span>YYYY/MM/DD HH:mm</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={dateTime}
            onSelect={handleDateSelect}
            // initialFocus
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.reverse().map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      dateTime && dateTime.getHours() === hour
                        ? "default"
                        : "ghost"
                    }
                    className="cursor-pointer sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      dateTime && dateTime.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="cursor-pointer sm:w-full shrink-0 aspect-square"
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
