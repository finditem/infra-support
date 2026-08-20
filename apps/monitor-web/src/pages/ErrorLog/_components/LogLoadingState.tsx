import { Icon } from "@/components";

const ICON_SIZE = 60;
const RING_SIZE = 80;
const RING_THICKNESS = 6;

const LogLoadingState = () => {
  return (
    <div role="status" className="h-full w-full gap-4 py-12 flex-col-center">
      <div className="relative flex-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <div
          className="absolute animate-spin rounded-full border-fg-primary-normal-default/20 border-t-fg-primary-normal-default"
          style={{ width: RING_SIZE, height: RING_SIZE, borderWidth: RING_THICKNESS }}
        />
        <Icon name="loadingErrorlog" size={ICON_SIZE} />
      </div>
      <p className="typo-header3-bold text-fg-primary-normal-default">
        에러 로그를 불러오고 있어요.
      </p>
    </div>
  );
};

export default LogLoadingState;
