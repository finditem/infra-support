import { Badge } from "@/components";
import { ImpactedFeature } from "../_types";

const DUMMY_FEATURES: ImpactedFeature[] = [
  { id: "1", name: "지도 표시" },
  { id: "2", name: "위치 선택" },
  { id: "3", name: "게시글 작성 시 주소 검색" },
  { id: "4", name: "내 주변 분실물 조회" },
];

const DetailImpactedFeatures = () => {
  return (
    <section
      aria-describedby="features-description"
      aria-labelledby="features-title"
      className="flex min-h-0 min-w-0 flex-col justify-between rounded-xl border border-[#DFDFDF] bg-white px-12 py-8"
    >
      <div className="flex flex-col gap-[13px]">
        <h2 id="features-title" className="text-header1-semibold">
          영향 받는 기능
        </h2>
        <span id="features-description" className="text-[#1D1D1D]/40">
          이 API에 장애 시 영향을 받는 사용자 기능
        </span>
      </div>

      <div aria-label="영향 받는 기능 목록" role="region" tabIndex={0} className="overflow-x-auto">
        <ul className="flex items-center gap-3">
          {DUMMY_FEATURES.map((feature) => (
            <li key={feature.id} className="shrink-0">
              <Badge className="min-h-[40px] px-4" label={feature.name} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DetailImpactedFeatures;
