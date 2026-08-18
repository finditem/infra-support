import { BasicButton, ModalLayout } from "@/components";

interface ApiEditCancelModalProps {
  open: boolean;
  onOpenChange: (nextOpen: boolean) => void;
  /** 변경 사항을 버리고 상세 페이지로 돌아가는 콜백 */
  onConfirm: () => void;
}

const ApiEditCancelModal = ({ open, onOpenChange, onConfirm }: ApiEditCancelModalProps) => {
  return (
    <ModalLayout
      aria-describedby="api-edit-cancel-description"
      aria-labelledby="api-edit-cancel-title"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex w-[420px] flex-col gap-6 rounded-xl bg-white p-8">
        <div className="flex flex-col gap-3">
          <h2 id="api-edit-cancel-title" className="typo-header3-bold text-layout-header">
            수정을 취소할까요?
          </h2>
          <p id="api-edit-cancel-description" className="typo-body1-regular text-layout-body">
            지금까지 변경한 내용은 저장되지 않습니다.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <BasicButton
            className="min-h-[48px] min-w-[100px] border border-border-neutural-normal-default bg-white text-layout-header"
            onClick={() => onOpenChange(false)}
          >
            <span className="typo-header4-medium">계속 수정</span>
          </BasicButton>
          <BasicButton className="min-h-[48px] min-w-[100px]" onClick={onConfirm}>
            <span className="typo-header4-medium text-white">취소하기</span>
          </BasicButton>
        </div>
      </div>
    </ModalLayout>
  );
};

export default ApiEditCancelModal;
