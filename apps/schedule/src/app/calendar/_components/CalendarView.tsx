"use client";

import { useState } from "react";
import type { ProfileWithColor } from "../../_types/kanban";
import type { MockAvailabilityBlock } from "../_lib/calendarMockData";
import AvailabilityTimePicker from "./AvailabilityTimePicker";
import CalendarGrid from "./CalendarGrid";
import MemberSidebar from "./MemberSidebar";

interface CalendarViewProps {
  monthStart: Date;
  profiles: ProfileWithColor[];
  profileColorMap: Map<string, ProfileWithColor>;
  availability: MockAvailabilityBlock[];
}

const CalendarView = ({
  monthStart,
  profiles,
  profileColorMap,
  availability,
}: CalendarViewProps) => {
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
          monthStart={monthStart}
          profileColorMap={profileColorMap}
          selectedProfileId={selectedProfileId}
          onSelectDate={setSelectedDate}
        />
      </div>

      {selectedDate && (
        <AvailabilityTimePicker date={selectedDate} onCancel={() => setSelectedDate(null)} />
      )}
    </div>
  );
};

export default CalendarView;
