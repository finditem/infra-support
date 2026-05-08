import { BasicButton, TextField } from "@/components";
import { useLoginForm } from "../_hooks";

const LoginForm = () => {
  const { values, handleChange, handleSubmit, isDisabled, isPending } = useLoginForm();

  return (
    <form className="flex w-full flex-col gap-[70px]" onSubmit={handleSubmit}>
      <fieldset className="flex flex-col gap-[30px]">
        <legend className="sr-only">로그인 정보</legend>
        <TextField
          autoComplete="username"
          label="관리자 계정 ID"
          name="username"
          placeholder="관리자 계정 아이디를 입력해 주세요."
          type="text"
          value={values.username}
          onChange={handleChange("username")}
        />
        <TextField
          autoComplete="current-password"
          label="비밀번호"
          name="password"
          placeholder="비밀번호를 입력해 주세요."
          type="password"
          value={values.password}
          onChange={handleChange("password")}
        />
      </fieldset>

      <BasicButton
        className="min-h-[56px] text-[20px] font-bold leading-6"
        disabled={isDisabled}
        loading={isPending}
        type="submit"
      >
        로그인
      </BasicButton>
    </form>
  );
};

export default LoginForm;
