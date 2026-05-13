import { ReactNode } from "react";
import { Badge, BasicButton, Icon } from "@/components";
import { cn } from "@/utils";
import { DetailSettingsData } from "../_types";

const DUMMY_SETTINGS: DetailSettingsData = {
  requestUrl: "https://dapi.kakao.com/v2/local/search/address.json",
  httpMethod: "GET",
  checkInterval: "10분",
  isActive: true,
  isNotificationEnabled: true,
};

const DetailSettings = () => {
  const { requestUrl, httpMethod, checkInterval, isActive, isNotificationEnabled } = DUMMY_SETTINGS;

  return (
    <section
      aria-labelledby="settings-title"
      className="my-8 flex flex-col gap-[60px] rounded-xl border border-[#DFDFDF] bg-white px-12 py-8"
    >
      <div className="flex items-center justify-between">
        <h2 id="settings-title" className="text-header1-bold">
          API 설정 정보
        </h2>
        <BasicButton className="border border-[#DFDFDF] px-5 py-4" variant="inversed">
          <span className="flex items-center gap-1 text-[#1D1D1D]">
            <Icon name="editPencil" size={24} />
            <span className="text-body1-medium">설정 수정</span>
          </span>
        </BasicButton>
      </div>

      <dl className="flex flex-col gap-6">
        <SettingItem label="요청 URL">
          <div className="rounded-lg border border-border-neutural-default bg-fill-neutural-iversed-disabled px-3 py-2">
            {requestUrl}
          </div>
        </SettingItem>

        <div className="flex gap-[60px]">
          <SettingItem label="HTTP Method">
            <Badge
              className="rounded-lg border border-border-neutural-default bg-fill-neutural-iversed-disabled px-3 py-1"
              label={httpMethod}
            />
          </SettingItem>

          <SettingItem label="체크 주기">
            <span>{checkInterval}</span>
          </SettingItem>

          <SettingItem label="활성 상태">
            <span className="rounded-full bg-fill-neutural-iversed-disabled px-3 py-1 text-fg-primary-normal-pressed flex-center">
              {isActive ? "활성" : "비활성"}
            </span>
          </SettingItem>

          <SettingItem label="알림">
            <span className="rounded-full bg-fill-neutural-iversed-disabled px-3 py-1 text-fg-primary-normal-pressed flex-center">
              {isNotificationEnabled ? "활성" : "비활성"}
            </span>
          </SettingItem>
        </div>
      </dl>
    </section>
  );
};

export default DetailSettings;

const SettingItem = ({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-3", className)}>
    <dt className="text-body1-medium text-[#1D1D1D]/40">{label}</dt>
    <dd className="text-layout-header">{children}</dd>
  </div>
);
