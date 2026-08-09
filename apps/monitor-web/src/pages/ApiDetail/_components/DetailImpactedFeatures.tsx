import { Badge } from "@/components";
import type { ImpactedFeature } from "../_types";

interface DetailImpactedFeaturesProps {
  features: ImpactedFeature[];
}

const DetailImpactedFeatures = ({ features }: DetailImpactedFeaturesProps) => {
  return (
    <section
      aria-describedby="features-description"
      aria-labelledby="features-title"
      className="flex min-h-0 min-w-0 flex-col justify-between rounded-xl border border-[#DFDFDF] bg-white px-12 py-8"
    >
      <div className="flex flex-col gap-[13px]">
        <h2 id="features-title" className="typo-header3-bold">
          영향 받는 기능
        </h2>
        <span id="features-description" className="typo-body2-medium text-[#1D1D1D]/40">
          이 API에 장애 시 영향을 받는 사용자 기능
        </span>
      </div>

      {features.length === 0 ? (
        <p className="typo-body2-medium min-h-[40px] text-layout-body">
          영향 받는 기능으로 등록된 항목이 없습니다.
        </p>
      ) : (
        <div
          aria-label="영향 받는 기능 목록"
          role="region"
          tabIndex={0}
          className="overflow-x-auto"
        >
          <ul className="flex items-center gap-3">
            {features.map((feature) => (
              <li key={feature.id} className="shrink-0">
                <Badge className="typo-body2-medium min-h-[40px] px-4" label={feature.name} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default DetailImpactedFeatures;
