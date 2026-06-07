import AlertIcon from "@/assets/icons/alert.svg?react";
import BaseLogo from "@/assets/icons/base-logo.svg?react";
import Check from "@/assets/icons/check.svg?react";
import Clear from "@/assets/icons/clear.svg?react";
import EditPencil from "@/assets/icons/edit-pencil.svg?react";
import LoadingSpinner from "@/assets/icons/loading-spinner.svg?react";
import NotFound from "@/assets/icons/not-found.svg?react";
import ErrorLog from "@/assets/icons/errorLog.svg?react";
import Refresh from "@/assets/icons/refresh.svg?react";
import SidebarDashboard from "@/assets/icons/sidebar-dashboard.svg?react";
import SidebarDetail from "@/assets/icons/sidebar-detail.svg?react";
import SidebarError from "@/assets/icons/sidebar-error.svg?react";
import ArrowDown from "@/assets/icons/arrow-down.svg?react";
import ArrowLeft from "@/assets/icons/arrow-left.svg?react";
import ArrowRight from "@/assets/icons/arrow-right.svg?react";
import ArrowUp from "@/assets/icons/arrow-up.svg?react";
import User from "@/assets/icons/user.svg?react";

export const ICON_MAP = {
  alert: AlertIcon,
  baseLogo: BaseLogo,
  check: Check,
  clear: Clear,
  editPencil: EditPencil,
  loadingSpinner: LoadingSpinner,
  notFound: NotFound,
  errorLog: ErrorLog,
  refresh: Refresh,
  sidebarDashboard: SidebarDashboard,
  sidebarDetail: SidebarDetail,
  sidebarError: SidebarError,
  arrowDown: ArrowDown,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  user: User,
} as const;
