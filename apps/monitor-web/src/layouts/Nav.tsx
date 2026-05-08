import { NavLink } from "react-router-dom";

const PLACEHOLDER_API_ID = "1";
const PLACEHOLDER_ERROR_ID = "1";

const navItems = [
  { label: "대시보드", to: "/" },
  { label: "장애/에러 로그", to: "/errors" },
  { label: "API 상세", to: `/api/${PLACEHOLDER_API_ID}` },
  { label: "API 수정", to: `/api/${PLACEHOLDER_API_ID}/edit` },
  { label: "장애/에러 상세", to: `/api/${PLACEHOLDER_API_ID}/errors/${PLACEHOLDER_ERROR_ID}` },
  { label: "로그인", to: "/login" },
];

const Nav = () => {
  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r bg-white px-3 py-6">
      <p className="mb-6 px-2 text-base font-bold text-gray-900">API 모니터링</p>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, to }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`
            }
            end
            to={to}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Nav;
