import { ReactNode } from "react";
import { BasicButton, Icon } from "@/components";
import { MOCK_SETTINGS } from "@/mock";
import { cn } from "@/utils";

const DetailSettings = () => {
  const { requestUrl, checkInterval, isActive, isNotificationEnabled } = MOCK_SETTINGS;

  return (
    <section
      aria-labelledby="settings-title"
      className="my-8 flex flex-col gap-[60px] rounded-xl border border-[#DFDFDF] bg-white px-12 py-8"
    >
      <div className="flex items-center justify-between">
        <h2 id="settings-title" className="typo-header4-bold">
          API 설정 정보
        </h2>
        {/* TODO(지권): 버튼 outline 스타일 변경 필요 */}
        <BasicButton className="min-h-[56px] w-[155px] border border-border-neutural-normal-default bg-white py-4">
          <span className="flex items-center gap-2 text-fill-neutural-normal-default">
            <Icon name="editPencil" size={24} />
            <span className="typo-header4-semibold">설정수정</span>
          </span>
        </BasicButton>
      </div>

      <div className="flex flex-col gap-6">
        <SettingItem label="요청 URL">
          <div className="flex items-center gap-1 rounded-lg border border-border-neutural-default bg-fill-neutural-iversed-disabled px-3 py-2">
            <span className="typo-caption1-semibold rounded-full bg-[#D6F8E1] px-3 py-1 text-[#009E53]">
              GET
            </span>
            <span className="typo-body1-regular text-fg-neutural-disabled">{requestUrl}</span>
          </div>
        </SettingItem>

        <div className="flex w-fit rounded-xl border">
          <SettingItem className="gap-4 px-6 py-5" label="HTTP Method">
            <span className="typo-header4-semibold text-layout-header">GET</span>
          </SettingItem>

          <SettingItem className="gap-4 px-6 py-5" label="체크 주기">
            <span className="typo-header4-semibold text-layout-header">{checkInterval}</span>
          </SettingItem>

          <SettingItem className="gap-4 px-6 py-5" label="활성 상태">
            <span className="flex items-center gap-1 text-fg-primary-normal-pressed">
              {isActive ? (
                <div className="flex size-4 items-center justify-center rounded-full border border-[#009E53] bg-white">
                  <div aria-hidden className="size-2 rounded-full bg-[#0AA874]" />
                </div>
              ) : (
                <div className="size-4 rounded-full border border-border-neutural-normal-default bg-white" />
              )}
              <span className="typo-header4-semibold text-fg-primary-normal-default">
                {isActive ? "활성" : "비활성"}
              </span>
            </span>
          </SettingItem>

          <SettingItem className="gap-4 px-6 py-5" label="알림">
            <span className="flex items-center gap-1 text-fg-primary-normal-pressed">
              {isNotificationEnabled ? (
                <div className="flex size-4 items-center justify-center rounded-full border border-[#009E53] bg-white">
                  <div aria-hidden className="size-2 rounded-full bg-[#0AA874]" />
                </div>
              ) : (
                <div className="size-4 rounded-full border border-border-neutural-normal-default bg-white" />
              )}
              <span className="typo-header4-semibold text-fg-primary-normal-default">
                {isNotificationEnabled ? "활성" : "비활성"}
              </span>
            </span>
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
  <div className={cn("flex min-w-[204px] flex-col gap-3", className)}>
    <span className="typo-body2-medium text-layout-body">{label}</span>
    <div className="text-layout-header">{children}</div>
  </div>
);
