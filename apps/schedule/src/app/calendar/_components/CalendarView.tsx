"use client";

import { useState } from "react";
import type { AvailabilityRow } from "@/types/tables";
import type { ProfileWithColor } from "../../_types/kanban";
import AvailabilityTimePicker from "./AvailabilityTimePicker";
import CalendarGrid from "./CalendarGrid";
import MemberSidebar from "./MemberSidebar";

interface CalendarViewProps {
  monthStart: Date;
  profiles: ProfileWithColor[];
  profileColorMap: Map<string, ProfileWithColor>;
  availability: AvailabilityRow[];
  currentProfileId: string | null;
  holidayNames: Record<string, string>;
}

const CalendarView = ({
  monthStart,
  profiles,
  profileColorMap,
  availability: initialAvailability,
  currentProfileId,
  holidayNames,
}: CalendarViewProps) => {
  const [availability, setAvailability] = useState(initialAvailability);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div className="flex flex-1">
      <MemberSidebar
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onSelectProfile={setSelectedProfileId}
      />

      <div className="flex-1 overflow-y-auto p-7">
        <CalendarGrid
          availability={availability}
          holidayNames={holidayNames}
          monthStart={monthStart}
          profileColorMap={profileColorMap}
          selectedProfileId={selectedProfileId}
          onSelectDate={setSelectedDate}
        />
      </div>

      {selectedDate && currentProfileId && (
        <AvailabilityTimePicker
          currentProfileId={currentProfileId}
          date={selectedDate}
          existingBlocks={availability.filter(
            (block) => block.user_id === currentProfileId && block.available_date === selectedDate
          )}
          onCancel={() => setSelectedDate(null)}
          onCreated={(row) => {
            setAvailability((prev) => [...prev, row]);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
};

export default CalendarView;
