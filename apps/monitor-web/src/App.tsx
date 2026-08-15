import { useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { Dashboard, Login, ErrorLog, ApiDetail, ApiEdit, ErrorDetail, NotFound } from "./pages";
import { Sidebar, ToastContainer } from "./layouts";
import { AuthRoute, ScrollToTop } from "./components";

export default function App() {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main
        ref={mainRef}
        className="relative flex flex-1 flex-col overflow-x-auto overflow-y-auto bg-[#F7F7F7] p-8"
      >
        <ScrollToTop targetRef={mainRef} />
        <div className="flex min-w-[1520px] flex-1 flex-col">
          <Routes>
            <Route element={<Dashboard />} path="/" />

            <Route element={<AuthRoute requireAuth={false} />}>
              <Route element={<Login />} path="/login" />
            </Route>

            <Route element={<AuthRoute requireAuth={true} />}>
              <Route element={<ErrorLog />} path="/errors" />
              <Route element={<ApiDetail />} path="/api/:apiId" />
              <Route element={<ApiEdit />} path="/api/:apiId/edit" />
              <Route element={<ErrorDetail />} path="/api/:apiId/errors/:errorId" />
            </Route>

            {/* 코드에서 404 화면으로 보낼 수 있도록 catch-all과 별개로 주소를 하나 둔다. */}
            <Route element={<NotFound />} path="/404" />
            <Route element={<NotFound />} path="*" />
          </Routes>
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
