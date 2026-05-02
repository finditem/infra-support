import { Icon, TextField } from "@/components";

const Login = () => {
  return (
    <section className="max-w-[720px] gap-10 rounded-xl border border-[#DFDFDF] bg-white p-[100px] flex-col-center">
      <header className="gap-6 flex-col-center">
        <Icon name="baseLogo" size={100} />
        <h1 className="text-[30px] font-bold leading-[36px] tracking-[-0.06em]">
          찾아줘! API 모니터링
        </h1>
      </header>

      <form className="w-full">
        <fieldset className="flex flex-col gap-[30px]">
          <legend className="sr-only">로그인 정보</legend>
          <TextField label="관리자 계정 ID" placeholder="관리자 계정 아이디를 입력해 주세요." />
          <TextField label="비밀번호" placeholder="비밀번호를 입력해 주세요." type="password" />
        </fieldset>
        <button
          className="mt-[70px] w-full rounded-lg bg-[#C0C0C0] py-[16px] text-[20px] font-bold leading-6 text-white"
          type="submit"
        >
          로그인
        </button>
      </form>
    </section>
  );
};

export default Login;
