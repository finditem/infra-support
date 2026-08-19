import { useState } from "react";
import { Icon, Image, TextField, TextareaField } from "@/components";
import ApiInfoTooltip from "./ApiInfoTooltip";
import ApiSourceSelect from "./ApiSourceSelect";
import type { ApiEditFormErrors, ApiEditFormValues } from "../_types";

interface ApiDefaultInformationProps {
  values: ApiEditFormValues;
  errors: ApiEditFormErrors;
  /** 출처 드롭다운에 표시할 목록 */
  sources: string[];
  onChange: <TField extends keyof ApiEditFormValues>(
    field: TField,
    value: ApiEditFormValues[TField]
  ) => void;
}

// size-16(64px)으로 렌더링되므로 이미지 고유 크기도 같은 값으로 맞춘다.
const ICON_PREVIEW_SIZE = 64;

const ApiDefaultInformation = ({
  values,
  errors,
  sources,
  onChange,
}: ApiDefaultInformationProps) => {
  const [hasIconError, setHasIconError] = useState(false);
  const showIconPreview = !!values.iconUrl.trim() && !hasIconError;

  return (
    <section
      aria-labelledby="api-default-information-title"
      className="mt-6 flex flex-col gap-6 rounded-xl border border-[#DFDFDF] bg-white px-8 pb-6 pt-6 shadow-[0px_4px_20px_-4px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-6 rounded-full bg-[#1EB87B] flex-center">
            <Icon className="text-white" height={12} name="infoMark" width={2} />
          </span>
          <h2 id="api-default-information-title" className="typo-header3-bold text-layout-header">
            기본 정보
          </h2>
        </div>
        <p className="typo-body1-regular text-layout-body">상세 패널에 노출되는 정보</p>
      </div>

      <hr className="-mx-8 border-t border-[#DFDFDF]" />

      <div className="flex flex-col gap-8">
        <TextField
          id="api-name"
          errorMessage={errors.name}
          label="API 이름"
          labelClassName="typo-header4-bold"
          required
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
        />

        <TextareaField
          id="api-description"
          caption="상세 페이지 상단에 표시되는 한 줄 소개입니다."
          label="API 설명"
          labelClassName="!typo-header4-bold"
          maxLength={500}
          placeholder="예 : 카카오 지도 표시"
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
        />

        <div className="flex flex-col gap-3">
          <label className="typo-header4-bold text-layout-header" htmlFor="api-source">
            출처 <span className="text-error">*</span>
          </label>
          <ApiSourceSelect
            id="api-source"
            errorMessage={errors.source}
            sources={sources}
            value={values.source}
            onChange={(source) => onChange("source", source)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-3">
            <span className="typo-header4-bold text-layout-header">출처 바로가기</span>
            <span className="group relative size-6 rounded-full bg-fill-neutural-subtle-hover flex-center">
              <Icon
                aria-hidden={false}
                aria-label="API 제공처 또는 공식 문서 링크를 수정합니다."
                height={12}
                name="infoMark"
                width={2}
              />
              <ApiInfoTooltip text="API 제공처 또는 공식 문서 링크를 수정합니다." />
            </span>
          </span>
          <TextField
            id="api-source-link"
            endIcon={<Icon name="linkAngled" size={20} />}
            errorMessage={errors.sourceUrl}
            placeholder="https://..."
            value={values.sourceUrl}
            onChange={(event) => onChange("sourceUrl", event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-3">
            <span className="typo-header4-bold text-layout-header">
              카테고리 <span className="text-error">*</span>
            </span>
            <span className="group relative size-6 rounded-full bg-fill-neutural-subtle-hover flex-center">
              <Icon
                aria-hidden={false}
                aria-label="API 응답 데이터를 분류하는 기준입니다."
                height={12}
                name="infoMark"
                width={2}
              />
              <ApiInfoTooltip text="map, location, public-data 등 분류값을 수정합니다." />
            </span>
          </span>
          <TextField
            id="api-category"
            errorMessage={errors.category}
            value={values.category}
            onChange={(event) => onChange("category", event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="typo-header4-bold text-layout-header" htmlFor="api-icon">
            아이콘
          </label>
          <div className="flex items-center gap-4">
            {showIconPreview ? (
              <Image
                alt=""
                className="size-16 shrink-0 rounded-full object-cover"
                height={ICON_PREVIEW_SIZE}
                src={values.iconUrl.trim()}
                width={ICON_PREVIEW_SIZE}
                onError={() => setHasIconError(true)}
              />
            ) : (
              <div className="size-16 shrink-0 rounded-full bg-fg-neutural-inversed-disabled" />
            )}
            <TextField
              id="api-icon"
              className="flex-1"
              endIcon={<Icon name="linkAngled" size={20} />}
              errorMessage={errors.iconUrl}
              placeholder="https://.../icon.png"
              value={values.iconUrl}
              onChange={(event) => {
                setHasIconError(false);
                onChange("iconUrl", event.target.value);
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApiDefaultInformation;
