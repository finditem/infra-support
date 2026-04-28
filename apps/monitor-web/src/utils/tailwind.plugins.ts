import plugin from "tailwindcss/plugin";

/**
 * 프로젝트 공통 Tailwind 커스텀 유틸리티 플러그인
 *
 * @remarks
 * 자주 쓰이는 CSS 패턴을 단일 클래스로 제공합니다.
 *
 * - `.flex-center`     > flex items-center justify-center
 * - `.flex-col-center` > flex flex-col items-center justify-center
 * - `.u-ellipsis`      > overflow-hidden text-ellipsis whitespace-nowrap
 *
 * @author jikwon
 */

const customUtilities = plugin(({ addUtilities }) => {
  addUtilities({
    ".flex-center": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    ".flex-col-center": {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    ".u-ellipsis": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  });
});

export default customUtilities;
