import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { BasicButton, Icon } from "@/components";
import { useApiListQuery, useLogoutMutation, useUserQuery } from "@/queries";
import { cn } from "@/utils";

const ACTIVE_NAV_ITEM_CLASS =
  "rounded-[4px] border-border-neutural-default text-fg-primary-normal-default";

const API_NAV_ITEM_CLASS = "block px-[50px] py-[14px] text-fg-neutural-default";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isApiDetailOpen, setIsApiDetailOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
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
            <Link
              aria-label="찾아줘! API 모니터링 홈"
              className="flex items-center gap-[14px] outline-none"
              to="/"
            >
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
              // TODO(지권): outline 스타일 추가 후 변경 예정
              <BasicButton
                className="border border-border-primary-normal-default bg-white text-fill-primary-strong-default"
                loading={isPending}
                onClick={() => logout()}
              >
                로그아웃
              </BasicButton>
            ) : (
              // TODO(지권): as prop 패턴 추가 후 navigate 제거 예정
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
