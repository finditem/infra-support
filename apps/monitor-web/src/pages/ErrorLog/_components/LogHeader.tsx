import { Icon } from "@/components";

const LogHeader = () => {
  return (
    <header
      aria-labelledby="error-log-title"
      className="-mx-6 -mt-6 flex items-center border border-[#E2E8F0] bg-white px-6 py-4"
    >
      <Icon className="mr-2" height={22} name="errorLog" width={20} />
      <h1 id="error-log-title" className="typo-header3-bold">
        장애/에러 로그
      </h1>
    </header>
  );
};

export default LogHeader;
