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

const customUtilities = plugin(({ addUtilities, addComponents }) => {
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

  addComponents({
    ".typo-body1-semibold": {
      fontSize: "18px",
      fontWeight: "600",
      lineHeight: "16px",
    },
    ".typo-body1-medium": {
      fontSize: "18px",
      fontWeight: "500",
      lineHeight: "16px",
    },
    ".typo-body1-regular": {
      fontSize: "18px",
      fontWeight: "400",
      lineHeight: "16px",
    },
    ".typo-body2-semibold": {
      fontSize: "16px",
      fontWeight: "600",
      lineHeight: "24px",
    },
    ".typo-body2-medium": {
      fontSize: "16px",
      fontWeight: "500",
      lineHeight: "24px",
    },
    ".typo-body2-regular": {
      fontSize: "16px",
      fontWeight: "400",
      lineHeight: "24px",
    },
    ".typo-header1-bold": {
      fontSize: "30px",
      fontWeight: "700",
      lineHeight: "normal",
    },
    ".typo-header1-semibold": {
      fontSize: "30px",
      fontWeight: "600",
      lineHeight: "normal",
    },
    ".typo-header1-medium": {
      fontSize: "30px",
      fontWeight: "500",
      lineHeight: "normal",
    },
    ".typo-header2-bold": {
      fontSize: "28px",
      fontWeight: "700",
      lineHeight: "normal",
    },
    ".typo-header2-semibold": {
      fontSize: "28px",
      fontWeight: "600",
      lineHeight: "normal",
    },
    ".typo-header2-medium": {
      fontSize: "28px",
      fontWeight: "500",
      lineHeight: "normal",
    },
    ".typo-header3-bold": {
      fontSize: "24px",
      fontWeight: "700",
      lineHeight: "24px",
    },
    ".typo-header3-semibold": {
      fontSize: "24px",
      fontWeight: "600",
      lineHeight: "24px",
    },
    ".typo-header3-medium": {
      fontSize: "24px",
      fontWeight: "500",
      lineHeight: "24px",
    },
    ".typo-header3-regular": {
      fontSize: "24px",
      fontWeight: "400",
      lineHeight: "24px",
    },
    ".typo-header4-bold": {
      fontSize: "20px",
      fontWeight: "700",
      lineHeight: "24px",
    },
    ".typo-header4-semibold": {
      fontSize: "20px",
      fontWeight: "600",
      lineHeight: "24px",
    },
    ".typo-header4-medium": {
      fontSize: "20px",
      fontWeight: "500",
      lineHeight: "24px",
    },
    ".typo-header4-regular": {
      fontSize: "20px",
      fontWeight: "400",
      lineHeight: "24px",
    },
  });
});

export default customUtilities;
