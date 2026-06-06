import { useState } from "react";
import {
  CheckboxButton,
  ClearButton,
  Icon,
  LoadingSpinner,
  SearchInput,
  TextField,
  BasicButton,
  IconButton,
  ModalLayout,
  Badge,
  Chip,
  Skeleton,
  ApiResponseTimeChart,
} from "@/components";
import { useToast } from "@/hooks";
import { useLogoutMutation, useUserQuery } from "@/queries";
import MOCK_RESPONSE_TIME_DATA from "@/mock/ApiResponseTime";

const Dashboard = () => {
  const [checkedSm, setCheckedSm] = useState(false);
  const [checkedMd, setCheckedMd] = useState(false);
  const [checkedDisabled, setCheckedDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [isSelect, setIsSelected] = useState(false);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const { success, error, warning } = useToast();
  const { mutate: handleLogout } = useLogoutMutation();
  const { data: user } = useUserQuery();

  return (
    <div className="flex flex-col gap-1">
      <div className="my-2 border">
        <p>현재 로그인된 유저 정보</p>
        <p>{user ? user?.email : "로그인되지 않았습니다."}</p>
        {!!user && (
          <BasicButton className="mt-2" onClick={() => handleLogout()}>
            로그아웃 버튼
          </BasicButton>
        )}
      </div>

      <h1>대시보드</h1>

      <div className="mt-4 flex gap-2">
        <button
          className="rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
          onClick={() => success("성공 토스트", "성공 토스트 입니다.")}
        >
          Success
        </button>
        <button
          className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          onClick={() => error("실패 토스트", "실패 토스트 입니다")}
        >
          Error
        </button>
        <button
          className="rounded-lg bg-yellow-500 px-4 py-2 text-black transition-colors hover:bg-yellow-600"
          onClick={() => warning("경고 토스트", "경고 토스트 입니다")}
        >
          Warning
        </button>
      </div>

      <button className="gap-2 text-red-500 flex-center">
        <Icon name="alert" size={100} />
        <p>안녕하세요</p>
      </button>

      <div className="flex flex-col gap-4 p-4">
        <CheckboxButton checked={checkedSm} size="sm" onCheckedChange={setCheckedSm}>
          Small
        </CheckboxButton>
        <CheckboxButton checked={checkedMd} size="md" onCheckedChange={setCheckedMd}>
          Medium
        </CheckboxButton>
        <CheckboxButton
          checked={checkedDisabled}
          disabled
          size="md"
          onCheckedChange={setCheckedDisabled}
        >
          Disabled Medium
        </CheckboxButton>
      </div>

      <div>
        <ClearButton onClick={() => {}} />
      </div>

      <LoadingSpinner size={40} />

      <div className="flex flex-col gap-4">
        <SearchInput />
        <SearchInput placeholder="검색 Placeholder" />
        <SearchInput paramKey="default" placeholder="기본값" showSearchButton={false} />
      </div>

      <div className="flex flex-col gap-4">
        {/* 기본 */}
        <TextField placeholder="기본 입력" />

        {/* label */}
        <TextField id="with-label" label="이름" placeholder="이름을 입력하세요" />

        {/* 에러 메시지 */}
        <TextField
          id="with-error"
          errorMessage={
            email && !isValidEmail(email) ? "올바른 이메일 형식이 아닙니다." : undefined
          }
          label="이메일"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* 성공 메시지 */}
        <TextField
          id="with-success"
          label="닉네임"
          placeholder="닉네임을 입력하세요"
          successMessage="사용 가능한 닉네임입니다."
        />
      </div>
      <div className="gap-4 flex-center">
        <BasicButton size="big" onClick={() => {}}>
          big
        </BasicButton>
        <BasicButton size="medium" onClick={() => {}}>
          medium
        </BasicButton>
        <BasicButton size="small" onClick={() => {}}>
          small
        </BasicButton>
        <IconButton aria-label="확인" iconName="check" onClick={() => {}} />
      </div>

      <BasicButton onClick={() => setOpen(true)}>모달 열기</BasicButton>

      <ModalLayout aria-label="테스트 모달" open={open} onOpenChange={setOpen}>
        <div className="flex flex-col gap-2">
          <span>테스트 입니다.</span>
          <BasicButton onClick={() => setOpen(false)}>닫기</BasicButton>
        </div>
      </ModalLayout>

      <div className="flex flex-col gap-4 pt-5">
        <Badge label="정상" status="healthy" />
        <Badge label="지연" status="degraded" />
        <Badge label="장애" status="outage" />
        <Badge className="border-blue-200 bg-blue-50 text-blue-700" label="커스텀 배지" />
      </div>

      <Chip label="Text" selected={isSelect} onClick={() => setIsSelected((prev) => !prev)} />

      <div className="flex flex-col gap-3 pt-6">
        <h2>Skeleton Test</h2>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-40" rounded="sm" />
        <Skeleton className="h-6 w-40" rounded="md" />
        <Skeleton className="h-6 w-40" rounded="lg" />
        <Skeleton className="h-6 w-40" rounded="full" />
      </div>
      <section className="mt-6 rounded-xl border border-[#DFDFDF] bg-white p-6">
        <div className="h-[300px]">
          <ApiResponseTimeChart data={MOCK_RESPONSE_TIME_DATA} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
