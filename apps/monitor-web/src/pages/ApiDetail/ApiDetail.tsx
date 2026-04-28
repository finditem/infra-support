import { useParams } from "react-router-dom";

const ApiDetail = () => {
  const { apiId } = useParams<{ apiId: string }>();

  return (
    <div>
      <h1>API 상세 - {apiId}</h1>
    </div>
  );
};

export default ApiDetail;
