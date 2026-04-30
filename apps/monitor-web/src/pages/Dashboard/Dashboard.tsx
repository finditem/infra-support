import { useToast } from "@/hooks";
import { useMockListQuery } from "@/queries";

const Dashboard = () => {
  const { data, isLoading } = useMockListQuery();
  const { success, error, warning } = useToast();

  if (isLoading) {
    return <div>로딩</div>;
  }

  return (
    <div>
      <h1>대시보드</h1>

      <div className="mt-4 flex gap-2">
        <button
          className="rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
          onClick={() => success("성공 토스트")}
        >
          Success
        </button>
        <button
          className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          onClick={() => error("실패 토스트")}
        >
          Error
        </button>
        <button
          className="rounded-lg bg-yellow-500 px-4 py-2 text-black transition-colors hover:bg-yellow-600"
          onClick={() => warning("경고 토스트")}
        >
          Warning
        </button>
      </div>

      <ul>
        {(data ?? []).map((api) => (
          <li key={api.id}>
            {api.name} - {api.url} - {api.created_at}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
