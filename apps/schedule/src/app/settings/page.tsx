import { redirect } from "next/navigation";

// 설정 하위 메뉴가 아직 팀 관리 하나뿐이라 /settings로 들어오면 그쪽으로 보낸다.
const SettingsPage = (): never => {
  redirect("/settings/teams");
};

export default SettingsPage;
