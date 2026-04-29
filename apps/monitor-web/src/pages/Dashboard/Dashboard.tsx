import { useState } from "react";
import { Checkbox, ClearButton, Icon } from "@/components";
import { useMockListQuery } from "@/queries";

const Dashboard = () => {
  const { data, isLoading } = useMockListQuery();
  const [checkedSm, setCheckedSm] = useState(false);
  const [checkedMd, setCheckedMd] = useState(false);
  const [checkedLg, setCheckedLg] = useState(false);

  if (isLoading) {
    return <div>로딩</div>;
  }

  return (
    <div>
      <h1>대시보드</h1>

      <ul>
        {(data ?? []).map((api) => (
          <li key={api.id}>
            {api.name} - {api.url} - {api.created_at}
          </li>
        ))}
      </ul>

      <button className="gap-2 text-red-500 flex-center">
        <Icon name="alert" size={100} />
        <p>안녕하세요</p>
      </button>

      <div className="flex flex-col gap-4 p-4">
        <Checkbox checked={checkedSm} size="sm" onCheckedChange={setCheckedSm}>
          Small
        </Checkbox>
        <Checkbox checked={checkedMd} size="md" onCheckedChange={setCheckedMd}>
          Medium
        </Checkbox>
        <Checkbox checked={checkedLg} size="lg" onCheckedChange={setCheckedLg}>
          Large
        </Checkbox>
      </div>

      <ClearButton onClick={() => {}} />
    </div>
  );
};

export default Dashboard;
