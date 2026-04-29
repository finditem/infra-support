import { useApisListQuery } from "@/queries";

const Dashboard = () => {
  const { data, isLoading, isError, error } = useApisListQuery();

  if (isLoading) {
    return <div>로딩</div>;
  }

  if (isError) {
    return <div>{error?.message}</div>;
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
