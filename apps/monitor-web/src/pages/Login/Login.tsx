import { LoginForm, LoginHeader } from "./_components";

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <section
        aria-label="찾아줘! API 모니터링 로그인"
        className="w-full max-w-[720px] gap-10 rounded-xl border border-[#DFDFDF] bg-white p-[100px] flex-col-center"
      >
        <LoginHeader />
        <LoginForm />
      </section>
    </div>
  );
};

export default Login;
