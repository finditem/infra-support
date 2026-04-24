import { cn } from "./utils";

export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">infra-support Dashboard</h1>
      <p className="mt-2 text-red-600">모니터링 대시보드</p>
      <p className={cn("text-red-600", "md:mt-2", "lg:text-blue-600")}>안녕하세요</p>
    </div>
  );
}
