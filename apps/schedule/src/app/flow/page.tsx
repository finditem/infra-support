// 작업 흐름(상위·하위 일정을 깃허브 브랜치처럼 보여주는 타임라인) 화면은 아직 데이터 모델을
// 정하는 중이다. 사이드바 메뉴 자리만 먼저 잡아두고, 이 페이지는 준비 중 안내로 둔다.
const FlowPage = () => (
  <main className="flex min-h-screen flex-col bg-surface">
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-lg font-semibold text-text-default">작업 흐름</h1>
      <p className="max-w-sm text-sm text-text-muted">
        상위·하위 일정을 타임라인으로 보여주는 작업 흐름 화면은 준비 중입니다.
      </p>
    </div>
  </main>
);

export default FlowPage;
