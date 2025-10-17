import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface NumberPadProps {
  onNumberClick: (num: number | null) => void;
}

const NumberPad = ({ onNumberClick }: NumberPadProps) => {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center max-w-md mx-auto animate-fade-in px-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button
          key={num}
          onClick={() => onNumberClick(num)}
          variant="outline"
          size="lg"
          className="min-w-[52px] min-h-[52px] sm:min-w-[60px] sm:min-h-[60px] text-xl sm:text-2xl font-semibold hover:bg-primary hover:text-primary-foreground transition-all touch-manipulation active:scale-95"
        >
          {num}
        </Button>
      ))}
      <Button
        onClick={() => onNumberClick(null)}
        variant="outline"
        size="lg"
        className="min-w-[52px] min-h-[52px] sm:min-w-[60px] sm:min-h-[60px] hover:bg-destructive hover:text-destructive-foreground transition-all touch-manipulation active:scale-95"
      >
        <Eraser className="w-6 h-6 sm:w-7 sm:h-7" />
      </Button>
    </div>
  );
};

export default NumberPad;
