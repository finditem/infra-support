import { Icon, TextareaField } from "@/components";
import ApiInfoTooltip from "./ApiInfoTooltip";
import type { ApiEditFormValues } from "../_types";

interface ApiOperationInformationProps {
  values: ApiEditFormValues;
  onChange: <TField extends keyof ApiEditFormValues>(
    field: TField,
    value: ApiEditFormValues[TField]
  ) => void;
}

const ApiOperationInformation = ({ values, onChange }: ApiOperationInformationProps) => {
  return (
    <section
      aria-labelledby="api-operation-information-title"
      className="mt-9 flex flex-col gap-9 rounded-xl border border-[#DFDFDF] bg-white px-[76px] pb-9 pt-[37px] shadow-[0px_4px_20px_-4px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center gap-2">
        <span className="size-6 rounded-full bg-[#1EB87B] flex-center">
          <Icon className="text-white" name="settings" size={16} />
        </span>
        <h2 id="api-operation-information-title" className="typo-header3-bold text-layout-header">
          운영 정보
        </h2>
      </div>

      <hr className="-mx-[76px] border-t border-[#DFDFDF]" />

      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <span className="flex items-center gap-3">
            <span className="typo-header4-bold text-layout-header">
              활성화 상태 <span className="text-error">*</span>
            </span>
            <span className="group relative size-6 rounded-full bg-fill-neutural-subtle-hover flex-center">
              <Icon
                aria-hidden={false}
                aria-label="비활성화 시 해당 API의 모니터링이 중단됩니다."
                height={12}
                name="infoMark"
                width={2}
              />
              <ApiInfoTooltip text="API를 모니터링 목록에 노출할지 여부를 수정합니다." />
            </span>
          </span>

          <label className="relative flex cursor-pointer items-center gap-4">
            <input
              className="peer sr-only"
              checked={values.isActive}
              type="checkbox"
              onChange={(event) => onChange("isActive", event.target.checked)}
            />
            <span className="inline-block h-[30px] w-16 shrink-0 rounded-full bg-fill-neutural-subtle-hover transition-colors peer-checked:bg-[#1EB87B]" />
            <span className="absolute left-1 top-1 size-[22px] rounded-full bg-white transition-transform peer-checked:translate-x-8" />
            <span className="typo-header4-bold text-layout-header transition-colors peer-checked:text-[#62CDA3]">
              활성화
            </span>
          </label>
        </div>

        <TextareaField
          id="api-memo"
          caption="운영 중 참고할 내용을 남겨 두는 칸입니다. 사용자에게는 노출되지 않습니다."
          label="메모"
          labelClassName="typo-header4-bold"
          maxLength={500}
          placeholder="예 : 2026년 3월부터 요금제 변경 예정"
          value={values.memo}
          onChange={(event) => onChange("memo", event.target.value)}
        />
      </div>
    </section>
  );
};

export default ApiOperationInformation;
