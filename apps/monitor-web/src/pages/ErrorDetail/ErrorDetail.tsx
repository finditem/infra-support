import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { BasicButton, ErrorBoundary, ErrorState } from "@/components";

// 쿼리를 호출하는 컴포넌트는 ErrorBoundary의 자식이어야 에러가 포착되므로, 페이지를 껍데기와 내용으로 나눈다.
const ErrorDetail = () => {
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={(_error, resetBoundary) => (
        <ErrorState icon="clear" message="장애/에러 상세 정보를 불러오지 못했습니다.">
          <BasicButton
            onClick={() => {
              resetQueryErrors();
              resetBoundary();
            }}
          >
            다시 시도
          </BasicButton>
        </ErrorState>
      )}
    >
      <ErrorDetailContent />
    </ErrorBoundary>
  );
};

export default ErrorDetail;

const ErrorDetailContent = () => {
  const { apiId, errorId } = useParams<{ apiId: string; errorId: string }>();

  return (
    <div>
      <h1>장애/에러 상세</h1>
      <p>API: {apiId}</p>
      <p>Error: {errorId}</p>
    </div>
  );
};
