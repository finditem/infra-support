import { Icon } from "@/components";

const Dashboard = () => {
  return (
    <div>
      <h1>대시보드</h1>
      <button className="gap-2 text-red-500 flex-center">
        <Icon name="alert" size={100} />
        <p>안녕하세요</p>
      </button>
    </div>
  );
};

export default Dashboard;
