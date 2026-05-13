import { Badge, BasicButton, Icon } from "@/components";

const DetailHeader = () => {
  return (
    <section className="-mx-8 -mt-8 flex items-center justify-between border border-[#E2E8F0] bg-white p-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <h1 className="text-header1-bold">Kakao Map API</h1>
          <Badge label="404" />
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-body1-regular text-[#1D1D1D]/40">상태</span>
            <span className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-fg-primary-normal-default" />
              <span className="text-body1-regular text-fg-primary-normal-default">정상</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-body1-regular text-[#1D1D1D]/40">카테고리</span>
            <span className="text-body1-regular text-[#1D1D1D]">map</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-body1-regular text-[#1D1D1D]/40">응답</span>
            <span className="text-body1-regular text-[#1D1D1D]">428ms</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-body1-regular text-[#1D1D1D]/40">마지막 체크</span>
            <time className="text-body1-regular text-[#1D1D1D]" dateTime="2026-04-24 15:30">
              2026-04-24 15:30
            </time>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-body1-regular text-[#1D1D1D]/40">최근 24시간 성공률</span>
            <span className="text-body1-regular text-[#1D1D1D]">99%</span>
          </div>
        </div>
      </div>
      <BasicButton className="h-[80px] min-w-[121px] rounded-xl border border-[#DFDFDF] bg-white px-7 py-8 text-[#1D1D1D]">
        <span className="flex items-center gap-1">
          <Icon name="editPencil" size={24} />
          <span className="text-body1-medium">수정</span>
        </span>
      </BasicButton>
    </section>
  );
};

export default DetailHeader;
