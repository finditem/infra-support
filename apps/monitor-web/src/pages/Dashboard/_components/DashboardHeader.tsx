import { Icon } from "@/components";

const DashboardHeader = () => {
  return (
    <header
      aria-labelledby="dashboard-title"
      className="-mx-8 -mt-8 flex items-center border border-[#E2E8F0] bg-white px-10 py-5"
    >
      <Icon className="m-4" height={23} name="sidebarDashboard" width={23} />
      <h1 id="dashboard-title" className="typo-header1-bold">
        메인 대시보드
      </h1>
    </header>
  );
};

export default DashboardHeader;
