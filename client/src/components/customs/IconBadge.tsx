import { LucideIcon, ShieldQuestion } from "lucide-react";
import { JSX } from "react";
import { useTranslation } from "react-i18next";

interface IconBadgeProps {
  icon?: LucideIcon | JSX.Element;
  color: string;
  label: string;
  translationKey?: string;
}

export const IconBadge = ({ icon, color, label, translationKey }: IconBadgeProps) => {
  const { t } = useTranslation();

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
      {translationKey ? t(translationKey) : label}
    </span>
  );
};
