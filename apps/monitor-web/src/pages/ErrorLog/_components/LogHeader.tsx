import { Icon } from "@/components";

const LogHeader = () => {
  return (
    <header
      aria-labelledby="error-log-title"
      className="-mx-8 -mt-8 flex items-center border border-[#E2E8F0] bg-white p-10"
    >
      <Icon className="m-4" height={26} name="errorLog" width={24} />
      <h1 id="error-log-title" className="text-header1-bold">
        장애/에러 로그
      </h1>
    </header>
  );
};

export default LogHeader;
