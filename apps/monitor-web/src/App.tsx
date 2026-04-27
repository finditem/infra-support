import { Routes, Route } from "react-router-dom";
import { Dashboard, Login, ErrorLog, ApiDetail, ApiEdit, ErrorDetail } from "./pages";
import { Nav } from "./components";

export default function App() {
  return (
    <div className="flex h-screen">
      <Nav />

      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/errors" element={<ErrorLog />} />
          <Route path="/api/:apiId" element={<ApiDetail />} />
          <Route path="/api/:apiId/edit" element={<ApiEdit />} />
          <Route path="/api/:apiId/errors/:errorId" element={<ErrorDetail />} />
        </Routes>
      </main>
    </div>
  );
}
