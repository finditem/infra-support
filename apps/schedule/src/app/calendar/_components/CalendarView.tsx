"use client";

import { Users } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-1">
      <MemberSidebar
        isOpen={isSidebarOpen}
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onClose={() => setIsSidebarOpen(false)}
        onSelectProfile={setSelectedProfileId}
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-7">
        <button
          className="mb-4 flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:bg-fill-neutural-subtle-hover sm:hidden"
          type="button"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Users aria-hidden size={16} />
          팀원 필터
        </button>

        <CalendarGrid
          availability={availability}
          currentProfileId={currentProfileId}
          holidayNames={holidayNames}
          monthStart={monthStart}
          profileColorMap={profileColorMap}
          selectedProfileId={selectedProfileId}
          onDeleted={(id) => setAvailability((prev) => prev.filter((block) => block.id !== id))}
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
