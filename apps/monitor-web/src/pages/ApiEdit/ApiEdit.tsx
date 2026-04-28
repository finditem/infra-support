import { useParams } from "react-router-dom";

const ApiEdit = () => {
  const { apiId } = useParams<{ apiId: string }>();

  return (
    <div>
      <h1>API 수정 - {apiId}</h1>
    </div>
  );
};

export default ApiEdit;
