import { Icon } from "@/components";

const LoginHeader = () => {
  return (
    <div className="gap-6 flex-col-center">
      <Icon name="baseLogo" size={100} />
      <h1 className="text-[30px] font-bold leading-[36px] tracking-[-0.06em]">
        찾아줘! API 모니터링
      </h1>
    </div>
  );
};

export default LoginHeader;
