import { useState } from "react";
import { Checkbox, Icon } from "@/components";

const Dashboard = () => {
  const [checkedSm, setCheckedSm] = useState(false);
  const [checkedMd, setCheckedMd] = useState(false);
  const [checkedLg, setCheckedLg] = useState(false);

  return (
    <div>
      <h1>대시보드</h1>

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
    </div>
  );
};

export default Dashboard;
