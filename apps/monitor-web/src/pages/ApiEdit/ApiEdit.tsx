import { useState } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BasicButton, ErrorBoundary, ErrorState, LoadingState } from "@/components";
import { ApiNotFoundError, useApiDetailQuery, useApiSourcesQuery } from "@/queries";
import {
  ApiDefaultInformation,
  ApiEditActionBar,
  ApiEditCancelModal,
  ApiEditHeader,
  ApiEditTitle,
  ApiOperationInformation,
} from "./_components";
import { useApiEditForm } from "./_hooks";
import type { ApiDetailData } from "@/pages/ApiDetail/_types";

// 쿼리를 호출하는 컴포넌트는 ErrorBoundary의 자식이어야 에러가 포착되므로, 페이지를 껍데기와 내용으로 나눈다.
const ApiEdit = () => {
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={(error, resetBoundary) => {
        // 존재하지 않는 API는 다시 시도해도 결과가 같으므로 404 페이지로 보낸다.
        if (error instanceof ApiNotFoundError) {
          return <Navigate replace to="/404" />;
        }

        return (
          <ErrorState icon="clear" message="API 정보를 불러오지 못했습니다.">
            <BasicButton
              onClick={() => {
                resetQueryErrors();
                resetBoundary();
              }}
            >
              다시 시도
            </BasicButton>
          </ErrorState>
        );
      }}
    >
      <ApiEditContent />
    </ErrorBoundary>
  );
};

export default ApiEdit;

const ApiEditContent = () => {
  const { apiId = "" } = useParams<{ apiId: string }>();
  const { data: apiData } = useApiDetailQuery(apiId);

  // 조회 실패는 ErrorBoundary로 던져지므로, 기본 정보가 없다는 것은 아직 로딩 중이라는 뜻이다.
  if (!apiData) {
    return <LoadingState message="API 정보를 불러오는 중입니다." />;
  }

  return <ApiEditForm apiData={apiData} apiId={apiId} />;
};

interface ApiEditFormProps {
  apiId: string;
  apiData: ApiDetailData;
}

// 폼 초기값을 조회 결과로 한 번만 세우기 위해, apiData가 확정된 뒤에 마운트되는 컴포넌트로 분리한다.
const ApiEditForm = ({ apiId, apiData }: ApiEditFormProps) => {
  const navigate = useNavigate();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { data: sources } = useApiSourcesQuery();
  const { values, errors, isDirty, isSaving, handleChange, handleSubmit } = useApiEditForm(
    apiData,
    apiId
  );

  const goBackToDetail = () => navigate(`/api/${apiId}`);

  // 변경 사항이 없으면 확인 절차 없이 바로 돌아간다.
  const handleCancel = () => {
    if (!isDirty) {
      goBackToDetail();
      return;
    }

    setIsCancelModalOpen(true);
  };

  return (
    <div className="-mx-6">
      <div className="mx-auto flex max-w-[960px] flex-col gap-5 px-6">
        <ApiEditHeader apiId={apiId} apiName={apiData.name} />
        <ApiEditTitle
          apiName={apiData.name}
          canSave={isDirty}
          isSaving={isSaving}
          onSave={handleSubmit}
        />
        <ApiDefaultInformation
          errors={errors}
          sources={sources ?? []}
          values={values}
          onChange={handleChange}
        />
        <ApiOperationInformation values={values} onChange={handleChange} />
      </div>

      <ApiEditActionBar
        canSave={isDirty}
        isSaving={isSaving}
        onCancel={handleCancel}
        onSave={handleSubmit}
      />

      <ApiEditCancelModal
        open={isCancelModalOpen}
        onConfirm={goBackToDetail}
        onOpenChange={setIsCancelModalOpen}
      />
    </div>
  );
};
