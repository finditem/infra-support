import { Badge, BasicButton, Icon } from "@/components";
import { cn } from "@/utils";
import type { ApiDetailData, ApiStatus } from "../_types";

interface DetailHeaderProps {
  apiData: ApiDetailData;
}

const DetailHeader = ({ apiData }: DetailHeaderProps) => {
  const headerInfoList = [
    { label: "카테고리", value: apiData.category },
    { label: "응답", value: apiData.responseTime },
    {
      label: "마지막 체크",
      value: apiData.lastChecked,
      dateTime: apiData.lastChecked,
    },
    { label: "최근 24시간 성공률", value: apiData.successRate },
  ];

  return (
    <section
      aria-labelledby="api-detail-title"
      className="-mx-8 -mt-8 flex items-center justify-between border border-[#E2E8F0] bg-white p-10"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <h1 id="api-detail-title" className="text-header1-bold">
            {apiData.name}
          </h1>
          <Badge aria-label={`HTTP 상태 코드: ${apiData.statusCode}`} label={apiData.statusCode} />
        </div>
        <dl className="flex gap-6">
          <StatusItem status={apiData.status} />
          {headerInfoList.map((info) => (
            <InfoItem key={info.label} {...info} />
          ))}
        </dl>
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

const STATUS_CONFIG = {
  normal: {
    label: "정상",
    color: "bg-fg-primary-normal-default",
    textColor: "text-fg-primary-normal-default",
  },
  error: {
    label: "장애",
    color: "bg-[#FF4D4F]",
    textColor: "text-[#FF4D4F]",
  },
  pending: {
    label: "지연",
    color: "bg-[#FAAD14]",
    textColor: "text-[#FAAD14]",
  },
} as const;

const StatusItem = ({ status }: { status: ApiStatus }) => {
  const { label, color, textColor } = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col gap-2">
      <dt className="text-body1-regular text-[#1D1D1D]/40">상태</dt>
      <dd className="flex items-center gap-2">
        <div aria-hidden="true" className={cn("size-3 rounded-full", color)} />
        <span className={cn("text-body1-regular", textColor)}>{label}</span>
      </dd>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
  dateTime?: string;
}

const InfoItem = ({ label, value, dateTime }: InfoItemProps) => {
  const Tag = dateTime ? "time" : "span";

  return (
    <div className="flex flex-col gap-2">
      <dt className="text-body1-regular text-[#1D1D1D]/40">{label}</dt>
      <dd>
        <Tag className="text-body1-regular text-[#1D1D1D]" {...(dateTime && { dateTime })}>
          {value}
        </Tag>
      </dd>
    </div>
  );
};
