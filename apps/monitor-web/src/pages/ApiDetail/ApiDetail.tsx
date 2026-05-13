import { useParams } from "react-router-dom";
import { Badge, BasicButton, Icon } from "@/components";

const ApiDetail = () => {
  const { apiId } = useParams<{ apiId: string }>();
  console.log(apiId);

  return (
    <div>
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
            <Icon name="alert" size={24} />
            <span className="text-body1-medium">수정</span>
          </span>
        </BasicButton>
      </section>

      <section className="my-8 flex items-center rounded-xl border border-[#DFDFDF] bg-white py-8">
        <div className="flex flex-col gap-[13px] px-12 py-8">
          <span className="text-header1-bold text-[#1D1D1D]">평균 응답 속도</span>
          <div className="text-body1-regular flex items-center gap-3 text-[#1D1D1D]/40">
            <div className="flex items-baseline text-[#1D1D1D]">
              <span className="fond-bold text-[32px]">443</span>
              <span className="text-header1-medium">ms</span>
            </div>
            <span>최고1,230ms</span>
            <span>최저 210ms</span>
          </div>
        </div>

        <div className="flex flex-col gap-[13px] px-12 py-8">
          <span className="text-header1-bold text-[#1D1D1D]">성공률 (24h)</span>
          <span className="text-header1-bold text-[#1D1D1D]">99%</span>
        </div>

        <div className="flex flex-col gap-[13px] px-12 py-8">
          <span className="text-header1-bold text-[#1D1D1D]">장애 횟수 (24h)</span>
          <span className="text-header1-bold text-[#1D1D1D]">1회</span>
        </div>

        <div className="flex flex-col gap-[13px] px-12 py-8">
          <span className="text-header1-bold text-[#1D1D1D]">마지막 장애 발생</span>
          <span className="text-header1-bold text-[#1D1D1D]">2026-04-24 13:20</span>
        </div>
      </section>

      <div className="grid h-[620px] min-h-0 grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="min-w-0 bg-gray-300" title="표 들어갈 자리" />

        <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,2fr)_minmax(0,1fr)] gap-8">
          <section className="flex min-h-0 min-w-0 flex-col gap-[60px] rounded-xl border border-[#DFDFDF] bg-white px-12 py-8">
            <div className="flex items-center justify-between">
              <h2 className="text-header1-semibold">최근 체크 로그</h2>
              <span className="text-body1-medium block text-[#1D1D1D]/40">10분 주기</span>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-[6px]">
                  <div className="size-3 rounded-full bg-fg-primary-normal-default" />
                  <time dateTime="">15:30</time>
                </div>
                <span>에러 메세지</span>
                <span>HTTP 200</span>
                <span>428ms</span>
              </div>
            </div>
          </section>
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
        </div>
      </div>

      <section className="my-8 flex flex-col gap-[60px] rounded-xl border border-[#DFDFDF] bg-white px-12 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-header1-bold">API 설정 정보</h2>
          <BasicButton className="border border-[#DFDFDF] px-5 py-4" variant="inversed">
            <span className="flex items-center gap-1 text-[#1D1D1D]">
              <Icon name="alert" size={24} />
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

      <section className="rounded-xl border border-[#DFDFDF] bg-white px-12 py-8">
        <h2 className="text-header1-bold">최근 장애 / 에러 상세 목록</h2>
      </section>
    </div>
  );
};

export default ApiDetail;
