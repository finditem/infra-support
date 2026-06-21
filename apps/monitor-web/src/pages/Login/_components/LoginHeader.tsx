import { Icon } from "@/components";
import { Link } from "react-router-dom";

const LoginHeader = () => {
  return (
    <Link className="gap-6 flex-col-center" to="/">
      <Icon name="baseLogo" size={100} />
      <h1 className="text-[30px] font-bold leading-[36px] tracking-[-0.06em] text-layout-header">
        찾아줘! API 모니터링
      </h1>
    </Link>
  );
};

export default LoginHeader;
