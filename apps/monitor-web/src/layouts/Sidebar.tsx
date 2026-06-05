import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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

const Nav = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const { pathname } = useLocation();
  const isApiRoute = pathname.startsWith("/api/");

  const { data: user } = useUserQuery();
  const { isPending, mutate: logout } = useLogoutMutation();

  useEffect(() => {
    if (isApiRoute) {
      setIsDetailOpen(true);
    }
  }, [isApiRoute]);

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col gap-5 bg-white px-[10px] pb-5 pt-10",
        "border border-[#E2E8F0]",
        isOpen ? "w-[400px]" : "w-[133px]"
      )}
    >
      <div className="flex h-full flex-col justify-between px-6 pb-4">
        <div className="flex flex-col gap-5">
          <header className="relative flex items-center justify-start gap-[14px]">
            <Icon name="baseLogo" size={40} />
            {isOpen && (
              <span className="text-[20px] font-bold leading-[28px]">찾아줘! API 모니터링</span>
            )}
            <button
              className="absolute -right-16 size-9 rounded-[10px]"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <Icon name="baseLogo" />
            </button>
          </header>
          <nav
            className={cn(
              "typo-header4-semibold flex flex-col items-start gap-2",
              isOpen ? "text-[#393939]" : "text-fg-primary-normal-default"
            )}
          >
            <NavLink
              className={({ isActive }) =>
                cn(
                  "flex w-full items-center border border-transparent px-2 py-1",
                  isActive &&
                    "rounded-[4px] border-border-neutural-default text-fg-primary-normal-default"
                )
              }
              to="/"
            >
              <Icon className="p-4" name="sidebarDashboard" size={54} />
              {isOpen && "대시보드"}
            </NavLink>
            <button
              className={cn(
                "flex w-full items-center justify-between border border-transparent px-2 py-1",
                isApiRoute &&
                  "rounded-[4px] border-border-neutural-default text-fg-primary-normal-default"
              )}
              onClick={() => setIsDetailOpen((prev) => !prev)}
            >
              <div className="flex items-center">
                <Icon className="p-4" name="sidebarDetail" size={54} />
                {isOpen && "API 상세"}
              </div>
              {isOpen && <Icon className="text-[#757575]" name="check" size={20} />}
            </button>
            {isDetailOpen && (
              <ul className="max-h-[50%] overflow-y-auto">
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
            <NavLink
              className={({ isActive }) =>
                cn(
                  "flex w-full items-center border border-transparent px-2 py-1",
                  isActive &&
                    "rounded-[4px] border-border-neutural-default text-fg-primary-normal-default"
                )
              }
              to="/errors"
            >
              <Icon className="p-4" name="sidebarError" size={54} />
              {isOpen && "장애/에러 로그"}
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-[10px]">
            <div className="size-10 rounded-full bg-[#AAAAAA]" />
            {isOpen && <span>{user ? "관리자" : "로그인이 필요합니다."}</span>}
          </div>
          {!!user && isOpen && (
            <BasicButton loading={isPending} onClick={() => logout()}>
              로그아웃
            </BasicButton>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Nav;
