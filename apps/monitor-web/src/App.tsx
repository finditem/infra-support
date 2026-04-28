import { Routes, Route } from "react-router-dom";
import { Dashboard, Login, ErrorLog, ApiDetail, ApiEdit, ErrorDetail, NotFound } from "./pages";
import { Nav } from "./components";

export default function App() {
  return (
    <div className="flex h-screen">
      <Nav />

      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route element={<Dashboard />} path="/" />
          <Route element={<Login />} path="/login" />
          <Route element={<ErrorLog />} path="/errors" />
          <Route element={<ApiDetail />} path="/api/:apiId" />
          <Route element={<ApiEdit />} path="/api/:apiId/edit" />
          <Route element={<ErrorDetail />} path="/api/:apiId/errors/:errorId" />
          <Route element={<NotFound />} path="*" />
        </Routes>
      </main>
    </div>
  );
}
