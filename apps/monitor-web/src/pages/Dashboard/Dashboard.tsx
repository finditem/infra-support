import { useToast } from "@/hooks";

const Dashboard = () => {
  const { success, error, warning } = useToast();

  return (
    <div>
      <h1>대시보드</h1>

      {/* 토스트 예제 */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => success("성공 토스트")}
          className="rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
        >
          Success
        </button>
        <button
          onClick={() => error("실패 토스트")}
          className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
        >
          Error
        </button>
        <button
          onClick={() => warning("경고 토스트")}
          className="rounded-lg bg-yellow-500 px-4 py-2 text-black transition-colors hover:bg-yellow-600"
        >
          Warning
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
