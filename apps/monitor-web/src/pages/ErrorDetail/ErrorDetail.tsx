import { useParams } from "react-router-dom";

const ErrorDetail = () => {
  const { apiId, errorId } = useParams<{ apiId: string; errorId: string }>();

  return (
    <div>
      <h1>장애/에러 상세</h1>
      <p>API: {apiId}</p>
      <p>Error: {errorId}</p>
    </div>
  );
};

export default ErrorDetail;
