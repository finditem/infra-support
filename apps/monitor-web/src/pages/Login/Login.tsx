import { LoginForm, LoginHeader } from "./_components";

const Login = () => {
  return (
    <div className="flex-1 flex-center">
      <section
        aria-label="찾아줘! API 모니터링 로그인"
        className="w-full max-w-[480px] gap-6 rounded-xl border border-border-divider-default bg-white px-10 py-10 flex-col-center"
      >
        <LoginHeader />
        <LoginForm />
      </section>
    </div>
  );
};

export default Login;
