import { Badge, BasicButton, Icon } from "@/components";

const DetailSettings = () => {
  return (
    <section className="my-8 flex flex-col gap-[60px] rounded-xl border border-[#DFDFDF] bg-white px-12 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-header1-bold">API 설정 정보</h2>
        <BasicButton className="border border-[#DFDFDF] px-5 py-4" variant="inversed">
          <span className="flex items-center gap-1 text-[#1D1D1D]">
            <Icon name="editPencil" size={24} />
            <span className="text-body1-medium">설정 수정</span>
          </span>
        </BasicButton>
      </div>
      <div className="flex flex-col gap-6 text-[#1D1D1D]/40">
        <div className="flex flex-col gap-3">
          <span>요청 URL</span>
          <div className="rounded-lg border border-border-neutural-default bg-fill-neutural-iversed-disabled px-3 py-2 text-layout-header">
            {"<https://dapi.kakao.com/...>"}
          </div>
        </div>
        <div className="flex gap-[60px]">
          <div className="flex flex-col gap-2">
            <span>HTTP Method</span>
            <Badge
              className="rounded-lg border border-border-neutural-default bg-fill-neutural-iversed-disabled px-3 py-1 text-layout-header"
              label="GET"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span>체크 주기</span>
            <span className="text-layout-header">10분</span>
          </div>
          <div className="flex flex-col gap-2">
            <span>활성 상태</span>
            <span className="rounded-full bg-fill-neutural-iversed-disabled px-3 py-1 text-fg-primary-normal-pressed flex-center">
              활성
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span>알림</span>
            <span className="rounded-full bg-fill-neutural-iversed-disabled px-3 py-1 text-fg-primary-normal-pressed flex-center">
              활성
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailSettings;
