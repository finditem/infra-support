import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { BasicButton, Icon } from "@/components";
import { useLogoutMutation, useUserQuery } from "@/queries";
import { cn } from "@/utils";

const API_NAV_ITEMS = [
  { id: "kakao-local", label: "Kakao 로컬" },
  { id: "kakao-map", label: "Kakao 지도" },
  { id: "kakao-login", label: "Kakao 로그인" },
  { id: "kakao-share", label: "Kakao 공유" },
  { id: "vworld-address-search", label: "VWORLD 주소 검색 서비스" },
  { id: "public-data-found-items", label: "공공데이터포털 습득물 정보 조회" },
  { id: "public-data-lost-items", label: "공공데이터포털 분실물 정보 조회" },
];

const ACTIVE_NAV_ITEM_CLASS =
  "rounded-[4px] border-border-neutural-default text-fg-primary-normal-default";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isApiDetailOpen, setIsApiDetailOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isApiRoute = pathname.startsWith("/api/");

  const { data: user } = useUserQuery();
  const { isPending, mutate: logout } = useLogoutMutation();

  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center border border-transparent px-2 py-1",
      isOpen ? "w-full" : "justify-center",
      isActive && ACTIVE_NAV_ITEM_CLASS
    );

  useEffect(() => {
    if (isApiRoute) {
      setIsApiDetailOpen(true);
      setIsOpen(true);
    }
  }, [isApiRoute]);

  return (
    <aside
      className={cn(
        "relative z-10 flex h-screen shrink-0 flex-col gap-5 bg-white px-[10px] pb-5 pt-10",
        "border border-[#E2E8F0]",
        isOpen ? "w-[400px]" : "w-[133px]"
      )}
    >
      <div className="flex h-full flex-col px-6 pb-4">
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <header
            className={cn(
              "relative flex items-center gap-[14px]",
              isOpen ? "justify-start" : "justify-center"
            )}
          >
            <Link className="flex items-center gap-[14px] outline-none" to="/">
              <Icon name="baseLogo" size={40} />
              {isOpen && (
                <span className="text-[20px] font-bold leading-[28px] text-layout-header">
                  찾아줘! API 모니터링
                </span>
              )}
            </Link>
            <button
              aria-label={isOpen ? "사이드바 접기" : "사이드바 펼치기"}
              className="absolute -right-14 size-9 rounded-[10px] border border-border-neutural-default bg-white p-2 flex-center"
              onClick={() => {
                setIsOpen((prev) => {
                  if (prev) setIsApiDetailOpen(false);
                  return !prev;
                });
              }}
            >
              <Icon
                className="text-fg-neutural-default"
                name={isOpen ? "arrowLeft" : "arrowRight"}
                size={22}
              />
            </button>
          </header>

          <nav className="typo-header4-semibold text-[#393939]">
            <ul className={cn("flex flex-col gap-2", !isOpen && "items-center")}>
              <li className={cn(isOpen && "w-full")}>
                <NavLink className={navLinkClassName} to="/">
                  <Icon className="p-4" name="sidebarDashboard" size={54} />
                  {isOpen && "대시보드"}
                </NavLink>
              </li>
              <li className={cn(isOpen && "w-full")}>
                <button
                  aria-controls="api-nav-items"
                  aria-expanded={isApiDetailOpen}
                  className={cn(
                    "flex items-center border border-transparent px-2 py-1",
                    isOpen ? "w-full justify-between" : "justify-center",
                    isApiRoute && ACTIVE_NAV_ITEM_CLASS
                  )}
                  onClick={() => {
                    setIsApiDetailOpen((prev) => {
                      if (!prev) setIsOpen(true);
                      return !prev;
                    });
                  }}
                >
                  <div className="flex items-center">
                    <Icon className="p-4" name="sidebarDetail" size={54} />
                    {isOpen && "API 상세"}
                  </div>
                  {isOpen && (
                    <Icon
                      className="text-[#757575]"
                      name={isApiDetailOpen ? "arrowDown" : "arrowUp"}
                      size={20}
                    />
                  )}
                </button>
                {isApiDetailOpen && (
                  <ul id="api-nav-items" className="max-h-48 overflow-y-auto">
                    {API_NAV_ITEMS.map(({ id, label }) => (
                      <li key={id}>
                        <NavLink
                          className={({ isActive }) =>
                            cn(
                              "block px-[50px] py-[14px] text-fg-neutural-default",
                              isActive && "text-fg-primary-normal-default"
                            )
                          }
                          to={`/api/${id}`}
                        >
                          {label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              <li className={cn(isOpen && "w-full")}>
                <NavLink className={navLinkClassName} to="/errors">
                  <Icon className="p-4" name="sidebarError" size={54} />
                  {isOpen && "장애/에러 로그"}
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        <footer
          className={cn(
            "flex shrink-0 items-center py-3",
            isOpen ? "justify-between" : "justify-center"
          )}
        >
          <div className="flex items-center gap-[10px]">
            <Icon className="rounded-full" name={user ? "baseLogo" : "user"} size={40} />
            {isOpen && (
              <span className="typo-body1-semibold text-layout-header">
                {user ? "관리자" : "로그인이 필요합니다."}
              </span>
            )}
          </div>
          {isOpen &&
            (user ? (
              <BasicButton
                className="border border-border-primary-normal-default bg-white text-fill-primary-strong-default"
                loading={isPending}
                onClick={() => logout()}
              >
                로그아웃
              </BasicButton>
            ) : (
              <BasicButton className="min-h-[43px] min-w-[70px]" onClick={() => navigate("/login")}>
                로그인
              </BasicButton>
            ))}
        </footer>
      </div>
    </aside>
  );
};

export default Sidebar;
