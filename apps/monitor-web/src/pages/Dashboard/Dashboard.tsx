import { useState } from "react";
import {
  Checkbox,
  ClearButton,
  Icon,
  LoadingSpinner,
  SearchInput,
  TextField,
  BasicButton,
  IconButton,
} from "@/components";
import { useToast } from "@/hooks";
import { useMockListQuery } from "@/queries";

const Dashboard = () => {
  const { data, isLoading } = useMockListQuery();

  const [checkedSm, setCheckedSm] = useState(false);
  const [checkedMd, setCheckedMd] = useState(false);
  const [checkedLg, setCheckedLg] = useState(false);
  const [email, setEmail] = useState("");

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const { success, error, warning } = useToast();

  if (isLoading) {
    return <div>로딩</div>;
  }

  return (
    <div className="flex flex-col gap-1">
      <h1>대시보드</h1>

      <ul>
        {(data ?? []).map((api) => (
          <li key={api.id}>
            {api.name} - {api.url} - {api.created_at}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <button
          className="rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
          onClick={() => success("성공 토스트")}
        >
          Success
        </button>
        <button
          className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          onClick={() => error("실패 토스트")}
        >
          Error
        </button>
        <button
          className="rounded-lg bg-yellow-500 px-4 py-2 text-black transition-colors hover:bg-yellow-600"
          onClick={() => warning("경고 토스트")}
        >
          Warning
        </button>
      </div>

      <button className="gap-2 text-red-500 flex-center">
        <Icon name="alert" size={100} />
        <p>안녕하세요</p>
      </button>

      <div className="flex flex-col gap-4 p-4">
        <Checkbox checked={checkedSm} size="sm" onCheckedChange={setCheckedSm}>
          Small
        </Checkbox>
        <Checkbox checked={checkedMd} size="md" onCheckedChange={setCheckedMd}>
          Medium
        </Checkbox>
        <Checkbox checked={checkedLg} size="lg" onCheckedChange={setCheckedLg}>
          Large
        </Checkbox>
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
        <BasicButton size="big" variant="solid" onClick={() => {}}>
          big
        </BasicButton>
        <BasicButton size="medium" variant="solid" onClick={() => {}}>
          medium
        </BasicButton>
        <BasicButton size="small" variant="solid" onClick={() => {}}>
          small
        </BasicButton>
        <IconButton aria-label="확인" iconName="check" onClick={() => {}} />
      </div>
    </div>
  );
};

export default Dashboard;
