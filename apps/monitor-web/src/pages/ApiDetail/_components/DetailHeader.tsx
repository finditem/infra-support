import { Badge, BasicButton, Icon } from "@/components";
import type { ApiDetailData } from "../_types";

interface DetailHeaderProps {
  apiData: ApiDetailData;
}

const DetailHeader = ({ apiData }: DetailHeaderProps) => {
  return (
    <section
      aria-labelledby="api-detail-title"
      className="-mx-8 -mt-8 flex items-center justify-between border border-[#E2E8F0] bg-white p-10"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <img
              alt={`${apiData.name} 로고}`}
              className="size-9 rounded-md"
              src="/src/assets/mocks/api-detail-mock.png"
            />
            <h1 id="api-detail-title" className="typo-header2-bold text-layout-header">
              {apiData.name}
            </h1>
            <Badge
              aria-label={`HTTP 상태 코드: ${apiData.statusCode}`}
              label={apiData.statusCode}
            />
          </div>
          <p className="typo-body2-regular text-layout-body">
            카카오 지도 표시 및 좌표·주소 변환에 사용하는 지도 API입니다.
          </p>
        </div>

        <div className="typo-body2-medium flex items-center gap-6">
          <div className="flex gap-3">
            <span className="text-layout-body">카테고리</span>
            <span className="typo-header3-bold text-layout-header">map</span>
          </div>
          <div className="flex gap-3">
            <span className="text-layout-body">출처</span>
            <a
              aria-label="Kakao developers 개발자 센터 (새 창 열림)"
              className="typo-header3-bold flex text-yellow-400 hover:underline hover:underline-offset-2"
              href="https://developers.kakao.com/console/app/1353127"
              rel="noopener noreferrer"
              target="_blank"
            >
              Kakao <Icon name="arrowUpRight" size={28} />
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <BasicButton className="min-h-[56px] w-[150px] py-4">
          <span className="flex gap-2">
            <Icon name="arrowRotateRight" size={24} />
            <span className="typo-header4-bold">수동요청</span>
          </span>
        </BasicButton>
        <BasicButton className="min-h-[56px] min-w-[115px] border border-border-neutural-normal-default bg-white py-4 text-[#5D5D5D]">
          <span className="flex items-center gap-1">
            <Icon name="editPencil" size={24} />
            <span className="typo-header4-semibold">수정</span>
          </span>
        </BasicButton>
      </div>
    </section>
  );
};

export default DetailHeader;
