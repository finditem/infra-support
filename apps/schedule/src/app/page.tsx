import { redirect } from "next/navigation";
import { DEFAULT_PROJECT_KEY } from "./_lib/projects";

// 메인 경로는 기본 프로젝트의 칸반보드로 넘긴다. 실제 보드는 /project/[projectKey]가 그린다.
const HomePage = () => {
  redirect(`/project/${DEFAULT_PROJECT_KEY}`);
};

export default HomePage;
