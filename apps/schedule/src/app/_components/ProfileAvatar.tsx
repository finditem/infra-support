import { getInitial } from "../_lib/kanbanUtils";
import type { ProfileWithColor } from "../_types/kanban";
import { cn } from "@/utils";

/** 아바타 크기별 지름과 이니셜 글자 크기. 기존 화면들이 쓰던 세 가지 조합을 그대로 옮겼다. */
const SIZE_CLASS_NAME = {
  sm: "size-4 text-[8px]",
  md: "size-5 text-[9px]",
  lg: "size-6 text-[10px]",
};

interface ProfileAvatarProps {
  profile: ProfileWithColor;
  size?: keyof typeof SIZE_CLASS_NAME;
  className?: string;
}

/**
 * 팀원 아바타. 배경은 DB에 배정된 파스텔 색(profiles.color)이라 대비 확보를 위해
 * 글자색은 어두운 고정색을 쓴다.
 */
const ProfileAvatar = ({ profile, size = "md", className }: ProfileAvatarProps) => (
  <span
    className={cn(
      "flex shrink-0 items-center justify-center rounded-full font-bold text-slate-800",
      SIZE_CLASS_NAME[size],
      className
    )}
    style={{ backgroundColor: profile.color }}
    title={profile.name}
  >
    {getInitial(profile.name)}
  </span>
);

export default ProfileAvatar;
