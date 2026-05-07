import { Routes, Route } from "react-router-dom";
import { Dashboard, Login, ErrorLog, ApiDetail, ApiEdit, ErrorDetail, NotFound } from "./pages";
import { Nav, ToastContainer } from "./layouts";
import { AuthRoute } from "./components";

export default function App() {
  return (
    <div className="flex h-screen">
      <Nav />

      <main className="flex-1 overflow-y-auto bg-[#F7F7F7] p-8">
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

          <Route element={<NotFound />} path="*" />
        </Routes>
      </main>

      <ToastContainer />
    </div>
  );
}
