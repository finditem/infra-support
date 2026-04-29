import { useMockListQuery } from "@/queries";

const Dashboard = () => {
  const { data, isLoading } = useMockListQuery();

  if (isLoading) {
    return <div>로딩</div>;
  }

  return (
    <ul>
      {(data ?? []).map((api) => (
        <li key={api.id}>
          {api.name} - {api.url} - {api.created_at}
        </li>
      ))}
    </ul>
  );
};

export default Dashboard;
