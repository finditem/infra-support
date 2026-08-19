import { useNavigate, useParams } from "react-router-dom";
import { Badge, BasicButton, Icon } from "@/components";
import { useApiManualCheckMutation } from "@/queries";
import type { ApiDetailData } from "../_types";

interface DetailHeaderProps {
  apiData: ApiDetailData;
  statusCode: string;
}

const DetailHeader = ({ apiData, statusCode }: DetailHeaderProps) => {
  const { apiId = "" } = useParams<{ apiId: string }>();
  const navigate = useNavigate();
  const { name, description, category, source, sourceUrl, iconUrl } = apiData;
  const { mutate: runManualCheck, isPending: isManualChecking } = useApiManualCheckMutation(apiId);

  return (
    <section
      aria-labelledby="api-detail-title"
      className="-mx-6 -mt-6 flex items-center justify-between border border-[#E2E8F0] bg-white px-6 py-4"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {iconUrl ? (
              <img alt={`${name} 로고`} className="size-8 rounded-md" src={iconUrl} />
            ) : (
              <div aria-hidden className="size-8 rounded-md bg-fill-neutural-subtle-default" />
            )}
            <h1 id="api-detail-title" className="typo-header3-bold text-layout-header">
              {name}
            </h1>
            <Badge
              aria-label={`HTTP 상태 코드: ${statusCode}`}
              className="typo-caption1-semibold shrink-0 border-border-neutural-default text-layout-body"
              label={statusCode}
            />
          </div>
          {description && <p className="typo-body2-regular text-layout-body">{description}</p>}
        </div>

        <div className="typo-body2-medium flex items-center gap-4">
          <div className="flex gap-3">
            <span className="text-layout-body">카테고리</span>
            <span className="typo-body2-semibold text-layout-header">{category}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-layout-body">출처</span>
            {sourceUrl ? (
              <a
                aria-label={`${source} 출처 링크 (새 창 열림)`}
                className="typo-body2-semibold flex text-yellow-400 hover:underline hover:underline-offset-2"
                href={sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {source} <Icon name="arrowUpRight" size={14} />
              </a>
            ) : (
              <span className="typo-body2-semibold text-layout-header">{source}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <BasicButton
          className="min-h-[44px] w-[128px] py-2"
          loading={isManualChecking}
          onClick={() => runManualCheck()}
        >
          <span className="flex gap-2">
            <Icon name="arrowRotateRight" size={20} />
            <span className="typo-header4-bold">수동요청</span>
          </span>
        </BasicButton>
        <BasicButton
          className="min-h-[44px] min-w-[96px] py-2 text-[#5D5D5D]"
          variant="outline"
          onClick={() => navigate(`/api/${apiId}/edit`)}
        >
          <span className="flex items-center gap-1">
            <Icon name="editPencil" size={20} />
            <span className="typo-header4-semibold">수정</span>
          </span>
        </BasicButton>
      </div>
    </section>
  );
};

export default DetailHeader;
