import { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BasicButton, Icon } from "@/components";
import { cn } from "@/utils";
import type { ApiDetailData } from "../_types";
import { formatCheckInterval, formatThresholdMs } from "../_utils";

const EMPTY_VALUE = "-";

interface DetailSettingsProps {
  apiData: ApiDetailData;
}

const DetailSettings = ({ apiData }: DetailSettingsProps) => {
  const { apiId } = useParams<{ apiId: string }>();
  const navigate = useNavigate();
  const {
    requestUrl,
    httpMethod,
    checkIntervalMinutes,
    isActive,
    isNotificationEnabled,
    timeoutMs,
    delayThresholdMs,
  } = apiData;

  return (
    <section
      aria-labelledby="settings-title"
      className="my-5 flex flex-col gap-8 rounded-xl border border-[#DFDFDF] bg-white px-6 py-5"
    >
      <div className="flex items-center justify-between">
        <h2 id="settings-title" className="typo-header4-bold">
          API 설정 정보
        </h2>
        <BasicButton
          className="min-h-[36px] w-[104px] py-1.5"
          variant="outline"
          onClick={() => navigate(`/api/${apiId}/edit`)}
        >
          <span className="flex items-center gap-2 text-fill-neutural-normal-default">
            <Icon name="editPencil" size={16} />
            <span className="typo-body2-semibold">설정수정</span>
          </span>
        </BasicButton>
      </div>

      <div className="flex flex-col gap-5">
        <SettingItem label="요청 URL">
          <div className="flex items-center gap-1 rounded-lg border border-border-neutural-default bg-fill-neutural-iversed-disabled px-3 py-2">
            <span className="typo-caption1-semibold rounded-full bg-[#D6F8E1] px-3 py-1 text-[#009E53]">
              {httpMethod}
            </span>
            <span className="typo-body1-regular text-fg-neutural-disabled">
              {requestUrl ?? EMPTY_VALUE}
            </span>
          </div>
        </SettingItem>

        <div className="flex w-fit rounded-xl border">
          <SettingItem className="gap-3 px-4 py-3" label="HTTP Method">
            <span className="typo-header4-semibold text-layout-header">{httpMethod}</span>
          </SettingItem>

          <SettingItem className="gap-3 px-4 py-3" label="체크 주기">
            <span className="typo-header4-semibold text-layout-header">
              {formatCheckInterval(checkIntervalMinutes)}
            </span>
          </SettingItem>

          <SettingItem className="gap-3 px-4 py-3" label="활성 상태">
            <SettingStatus isEnabled={isActive} />
          </SettingItem>

          <SettingItem className="gap-3 px-4 py-3" label="알림">
            <SettingStatus isEnabled={isNotificationEnabled} />
          </SettingItem>

          <SettingItem className="gap-4 px-6 py-5" label="타임아웃">
            <SettingThreshold milliseconds={timeoutMs} />
          </SettingItem>

          <SettingItem className="gap-4 px-6 py-5" label="지연 임계값">
            <SettingThreshold milliseconds={delayThresholdMs} />
          </SettingItem>
        </div>
      </div>
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
  <div className={cn("flex min-w-[160px] flex-col gap-2", className)}>
    <span className="typo-body2-medium text-layout-body">{label}</span>
    <div className="text-layout-header">{children}</div>
  </div>
);

const SettingThreshold = ({ milliseconds }: { milliseconds: number | null }) => (
  <span
    className={cn(
      "typo-header4-semibold text-layout-header",
      milliseconds === null && "text-fg-neutural-disabled"
    )}
  >
    {formatThresholdMs(milliseconds)}
  </span>
);

const SettingStatus = ({ isEnabled }: { isEnabled: boolean }) => (
  <span className="flex items-center gap-1 text-fg-primary-normal-pressed">
    {isEnabled ? (
      <div className="size-4 rounded-full border border-[#009E53] bg-white flex-center">
        <div aria-hidden className="size-2 rounded-full bg-[#0AA874]" />
      </div>
    ) : (
      <div className="size-4 rounded-full border border-border-neutural-normal-default bg-white" />
    )}
    <span className="typo-header4-semibold text-fg-primary-normal-default">
      {isEnabled ? "활성" : "비활성"}
    </span>
  </span>
);
