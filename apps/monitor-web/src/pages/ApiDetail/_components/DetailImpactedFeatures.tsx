import { Badge } from "@/components";

const DetailImpactedFeatures = () => {
  return (
    <section className="flex min-h-0 min-w-0 flex-col justify-between rounded-xl border border-[#DFDFDF] bg-white px-12 py-8">
      <div className="flex flex-col gap-[13px]">
        <h2 className="text-header1-semibold">영향 받는 기능</h2>
        <span className="text-[#1D1D1D]/40">이 API에 장애 시 영향을 받는 사용자 기능</span>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto">
        <Badge className="min-h-[40px] shrink-0" label="지도 표시" />
        <Badge className="min-h-[40px] shrink-0" label="위치 선택" />
        <Badge className="min-h-[40px] shrink-0" label="게시글 작성 시 주소 검색" />
        <Badge className="min-h-[40px] shrink-0" label="내 주변 분실물 조회" />
      </div>
    </section>
  );
};

export default DetailImpactedFeatures;
