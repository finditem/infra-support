import { cn } from "@/utils";
import { getInitial } from "../_lib/kanbanUtils";

interface ProfileAvatarProps {
  name: string;
  color: string;
  className?: string;
}

/**
 * 팀원 색상 배경에 이름 이니셜을 얹은 원형 아바타.
 * 배경이 파스텔 계열이라 글자색은 흰색이 아니라 어두운 고정색을 쓴다.
 */
const ProfileAvatar = ({ name, color, className }: ProfileAvatarProps) => (
  <span
    aria-hidden
    className={cn(
      "flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-slate-800",
      className
    )}
    style={{ backgroundColor: color }}
  >
    {getInitial(name)}
  </span>
);

export default ProfileAvatar;
