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
      fontSize: "16px",
      fontWeight: "600",
      lineHeight: "22px",
    },
    ".typo-body1-medium": {
      fontSize: "16px",
      fontWeight: "500",
      lineHeight: "22px",
    },
    ".typo-body1-regular": {
      fontSize: "16px",
      fontWeight: "400",
      lineHeight: "22px",
    },
    ".typo-body2-bold": {
      fontSize: "14px",
      fontWeight: "700",
      lineHeight: "20px",
    },
    ".typo-body2-semibold": {
      fontSize: "14px",
      fontWeight: "600",
      lineHeight: "20px",
    },
    ".typo-body2-medium": {
      fontSize: "14px",
      fontWeight: "500",
      lineHeight: "20px",
    },
    ".typo-body2-regular": {
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "20px",
    },
    ".typo-header1-bold": {
      fontSize: "24px",
      fontWeight: "700",
      lineHeight: "32px",
    },
    ".typo-header1-semibold": {
      fontSize: "24px",
      fontWeight: "600",
      lineHeight: "32px",
    },
    ".typo-header1-medium": {
      fontSize: "24px",
      fontWeight: "500",
      lineHeight: "32px",
    },
    ".typo-header2-bold": {
      fontSize: "22px",
      fontWeight: "700",
      lineHeight: "30px",
    },
    ".typo-header2-semibold": {
      fontSize: "22px",
      fontWeight: "600",
      lineHeight: "30px",
    },
    ".typo-header2-medium": {
      fontSize: "22px",
      fontWeight: "500",
      lineHeight: "30px",
    },
    ".typo-header3-bold": {
      fontSize: "18px",
      fontWeight: "700",
      lineHeight: "24px",
    },
    ".typo-header3-semibold": {
      fontSize: "18px",
      fontWeight: "600",
      lineHeight: "24px",
    },
    ".typo-header3-medium": {
      fontSize: "18px",
      fontWeight: "500",
      lineHeight: "24px",
    },
    ".typo-header3-regular": {
      fontSize: "18px",
      fontWeight: "400",
      lineHeight: "24px",
    },
    ".typo-header4-bold": {
      fontSize: "16px",
      fontWeight: "700",
      lineHeight: "22px",
    },
    ".typo-header4-semibold": {
      fontSize: "16px",
      fontWeight: "600",
      lineHeight: "22px",
    },
    ".typo-header4-medium": {
      fontSize: "16px",
      fontWeight: "500",
      lineHeight: "22px",
    },
    ".typo-header4-regular": {
      fontSize: "16px",
      fontWeight: "400",
      lineHeight: "22px",
    },
    ".typo-caption1-bold": {
      fontSize: "12px",
      fontWeight: "700",
      lineHeight: "16px",
    },
    ".typo-caption1-semibold": {
      fontSize: "12px",
      fontWeight: "600",
      lineHeight: "16px",
    },
    ".typo-caption1-medium": {
      fontSize: "12px",
      fontWeight: "500",
      lineHeight: "16px",
    },
    ".typo-caption1-regular": {
      fontSize: "12px",
      fontWeight: "400",
      lineHeight: "16px",
    },
  });
});

export default customUtilities;
