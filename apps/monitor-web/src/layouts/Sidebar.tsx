import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { BasicButton, Icon } from "@/components";
import { useApiListQuery, useLogoutMutation, useUserQuery } from "@/queries";
import { cn } from "@/utils";

const ACTIVE_NAV_ITEM_CLASS =
  "rounded-[4px] border-border-neutural-default text-fg-primary-normal-default";

const API_NAV_ITEM_CLASS = "typo-body2-regular block px-12 py-2 text-fg-neutural-default";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isApiDetailOpen, setIsApiDetailOpen] = useState(false);
  const { pathname } = useLocation();
  const isApiRoute = pathname.startsWith("/api/");

  const { data: user } = useUserQuery();
  const { isPending, mutate: logout } = useLogoutMutation();
  // Sidebar는 ErrorBoundary 바깥에 마운트되므로, 목록 조회 실패로 화면 전체가 깨지지 않도록
  // 에러를 던지지 않고 isError로 직접 처리한다.
  const {
    data: apis,
    isError: isApiListError,
    isPending: isApiListPending,
  } = useApiListQuery({ throwOnError: false });

  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 border border-transparent px-2 py-1",
      isOpen ? "w-full" : "justify-center",
      isActive && ACTIVE_NAV_ITEM_CLASS
    );

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) setIsApiDetailOpen(false);
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (isApiRoute) {
      setIsApiDetailOpen(true);
      setIsOpen(true);
    }
  }, [isApiRoute]);

  // 맥은 cmd + b, 윈도우는 ctrl + b로 사이드바를 접고 펼친다.
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      if (event.key.toLowerCase() !== "b") return;

      event.preventDefault();
      toggleSidebar();
    };

    window.addEventListener("keydown", handleShortcut);

    return () => window.removeEventListener("keydown", handleShortcut);
  }, [toggleSidebar]);

  return (
    <aside
      className={cn(
        "relative z-10 flex h-screen shrink-0 flex-col gap-4 bg-white px-2 pb-4 pt-6",
        "border border-[#E2E8F0]",
        isOpen ? "w-[280px]" : "w-[92px]"
      )}
    >
      <div className="flex h-full flex-col px-3 pb-3">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <header
            className={cn(
              "relative flex items-center gap-3",
              isOpen ? "justify-start" : "justify-center"
            )}
          >
            <Link
              aria-label="찾아줘! API 모니터링 홈"
              className="flex items-center gap-3 outline-none"
              to="/"
            >
              <Icon name="baseLogo" size={32} />
              {isOpen && (
                <span className="typo-header4-bold text-layout-header">찾아줘! API 모니터링</span>
              )}
            </Link>
            <button
              aria-keyshortcuts="Meta+B Control+B"
              aria-label={isOpen ? "사이드바 접기" : "사이드바 펼치기"}
              className="absolute -right-10 size-8 rounded-lg border border-border-neutural-default bg-white p-1.5 flex-center"
              onClick={toggleSidebar}
            >
              <Icon
                className="text-fg-neutural-default"
                name={isOpen ? "arrowLeft" : "arrowRight"}
                size={18}
              />
            </button>
          </header>

          <nav className="typo-header4-semibold text-[#393939]">
            <ul className={cn("flex flex-col gap-2", !isOpen && "items-center")}>
              <li className={cn(isOpen && "w-full")}>
                <NavLink className={navLinkClassName} to="/">
                  <Icon className="p-1" name="sidebarDashboard" size={22} />
                  {isOpen && "대시보드"}
                </NavLink>
              </li>
              <li className={cn(isOpen && "w-full")}>
                <button
                  aria-controls="api-nav-items"
                  aria-expanded={isApiDetailOpen}
                  className={cn(
                    "flex items-center gap-2 border border-transparent px-2 py-1",
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
                  <div className="flex items-center gap-2">
                    <Icon className="p-1" name="sidebarDetail" size={22} />
                    {isOpen && "API 상세"}
                  </div>
                  {isOpen && (
                    <Icon
                      className="text-[#757575]"
                      name={isApiDetailOpen ? "arrowDown" : "arrowUp"}
                      size={16}
                    />
                  )}
                </button>
                {isApiDetailOpen && (
                  <ul id="api-nav-items" className="max-h-48 overflow-y-auto">
                    {isApiListPending && (
                      <li role="status" className={API_NAV_ITEM_CLASS}>
                        불러오는 중입니다.
                      </li>
                    )}
                    {isApiListError && (
                      <li role="alert" className={API_NAV_ITEM_CLASS}>
                        API 목록을 불러오지 못했습니다.
                      </li>
                    )}
                    {apis?.length === 0 && (
                      <li role="status" className={API_NAV_ITEM_CLASS}>
                        등록된 API가 없습니다.
                      </li>
                    )}
                    {apis?.map(({ id, name }) => (
                      <li key={id}>
                        <NavLink
                          className={({ isActive }) =>
                            cn(API_NAV_ITEM_CLASS, isActive && "text-fg-primary-normal-default")
                          }
                          to={`/api/${id}`}
                        >
                          {name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              <li className={cn(isOpen && "w-full")}>
                <NavLink className={navLinkClassName} to="/errors">
                  <Icon className="p-1" name="sidebarError" size={22} />
                  {isOpen && "장애/에러 로그"}
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        <footer
          className={cn(
            "flex shrink-0 items-center py-2",
            isOpen ? "justify-between" : "justify-center"
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className="rounded-full" name={user ? "baseLogo" : "user"} size={32} />
            {isOpen && (
              <span className="typo-body2-semibold text-layout-header">
                {user ? "관리자" : "로그인이 필요합니다."}
              </span>
            )}
          </div>
          {isOpen &&
            (user ? (
              <BasicButton loading={isPending} variant="outline-primary" onClick={() => logout()}>
                로그아웃
              </BasicButton>
            ) : (
              <BasicButton className="min-w-[64px]" as={Link} to="/login">
                로그인
              </BasicButton>
            ))}
        </footer>
      </div>
    </aside>
  );
};

export default Sidebar;
