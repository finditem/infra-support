import { Icon, TextField, TextareaField } from "@/components";
import ApiInfoTooltip from "./ApiInfoTooltip";

const ApiDefaultInformation = () => {
  return (
    <section
      aria-labelledby="api-default-information-title"
      className="mt-9 flex flex-col gap-9 rounded-xl border border-[#DFDFDF] bg-white px-[76px] pb-9 pt-[37px] shadow-[0px_4px_20px_-4px_rgba(0,0,0,0.05)]"
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

      <hr className="-mx-[76px] border-t border-[#DFDFDF]" />

      <div className="flex flex-col gap-12">
        <TextField
          id="api-name"
          defaultValue="Kakao Map API"
          label="API 이름"
          labelClassName="typo-header4-bold"
          required
        />

        <TextareaField
          id="api-description"
          caption="Caption"
          defaultValue=""
          label="API 설명"
          labelClassName="typo-header4-bold"
          maxLength={500}
          placeholder="예 : 카카오 지도 표시"
        />

        <div className="flex flex-col gap-4">
          <label className="typo-header4-bold text-layout-header" htmlFor="api-source">
            출처 <span className="text-error">*</span>
          </label>
          <button
            id="api-source"
            className="flex w-full items-center justify-between rounded-[10px] border border-border-neutural-normal-default bg-white px-[17px] py-[21px]"
            type="button"
          >
            <span className="typo-header4-semibold text-fg-neutural-default">Kakao</span>
            <Icon name="chevronDown" size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
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
            defaultValue="https://apis.map.kakao.com/"
            endIcon={<Icon name="linkAngled" size={20} />}
          />
        </div>

        <div className="flex flex-col gap-4">
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
          <TextField id="api-category" defaultValue="map" />
        </div>

        <div className="flex flex-col gap-4">
          <label className="typo-header4-bold text-layout-header" htmlFor="api-icon">
            아이콘
          </label>
          <div className="flex items-center gap-6">
            <div className="size-[100px] shrink-0 rounded-full bg-fg-neutural-inversed-disabled" />
            <TextField
              id="api-icon"
              className="flex-1"
              endIcon={<Icon name="linkAngled" size={20} />}
              placeholder="https://.../icon.png"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApiDefaultInformation;
