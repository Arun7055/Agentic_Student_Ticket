import { LucideIcon } from "lucide-react";

interface DepartmentCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradientClass: string;
  iconColorClass: string;
}

const DepartmentCard = ({ title, description, icon: Icon, gradientClass, iconColorClass }: DepartmentCardProps) => {
  return (
    <div className={`${gradientClass} rounded-lg p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-background/30 ${iconColorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
