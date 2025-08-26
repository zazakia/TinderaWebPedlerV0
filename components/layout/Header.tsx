import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function Header({ title, onBack, showBackButton = true }: HeaderProps) {
  return (
    <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </div>
  );
}