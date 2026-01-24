import { LucideIcon, ShieldQuestion } from "lucide-react";
import { JSX } from "react";

interface IconBadgeProps {
  icon?: LucideIcon | JSX.Element;
  color: string;
  label: string;
}

export const IconBadge = ({ icon, color, label }: IconBadgeProps) => {
  const renderIcon = () => {
    if (!icon) return <ShieldQuestion size={16} />;
    if (typeof icon === "function" || (typeof icon === "object" && "render" in icon)) {
      const Icon = icon as any;
      return <Icon size={16} />;
    }
    return icon;
  };

  return (
    <span className={`flex items-center gap-1 font-medium ${color}`}>
      {renderIcon()}
      {label}
    </span>
  );
};
