import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface NumberPadProps {
  onNumberClick: (num: number | null) => void;
  vertical?: boolean;
  mobileGrid?: boolean;
}

const NumberPad = ({ onNumberClick, vertical = false, mobileGrid = false }: NumberPadProps) => {
  // Mobile Grid Layout: 2 rows of 5 buttons (1-5, 6-9+Eraser)
  if (mobileGrid) {
    return (
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <div className="grid grid-cols-5 gap-2 px-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <Button
              key={num}
              onClick={() => onNumberClick(num)}
              variant="outline"
              size="lg"
              className="min-h-[52px] text-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-all touch-manipulation active:scale-95"
            >
              {num}
            </Button>
          ))}
          {[6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              onClick={() => onNumberClick(num)}
              variant="outline"
              size="lg"
              className="min-h-[52px] text-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-all touch-manipulation active:scale-95"
            >
              {num}
            </Button>
          ))}
          <Button
            onClick={() => onNumberClick(null)}
            variant="outline"
            size="lg"
            className="min-h-[52px] hover:bg-destructive hover:text-destructive-foreground transition-all touch-manipulation active:scale-95"
          >
            <Eraser className="w-6 h-6" />
          </Button>
        </div>
      </div>
    );
  }

  // Vertical or Horizontal Flex Layout (existing behavior)
  return (
    <div className={`flex gap-2 animate-fade-in ${vertical ? 'flex-col' : 'flex-wrap justify-center max-w-md mx-auto px-4'}`}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button
          key={num}
          onClick={() => onNumberClick(num)}
          variant="outline"
          size={vertical ? "default" : "lg"}
          className={`text-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-all touch-manipulation active:scale-95 ${
            vertical ? 'min-w-[48px] min-h-[48px]' : 'min-w-[52px] min-h-[52px] sm:min-w-[60px] sm:min-h-[60px] sm:text-2xl'
          }`}
        >
          {num}
        </Button>
      ))}
      <Button
        onClick={() => onNumberClick(null)}
        variant="outline"
        size={vertical ? "default" : "lg"}
        className={`hover:bg-destructive hover:text-destructive-foreground transition-all touch-manipulation active:scale-95 ${
          vertical ? 'min-w-[48px] min-h-[48px]' : 'min-w-[52px] min-h-[52px] sm:min-w-[60px] sm:min-h-[60px]'
        }`}
      >
        <Eraser className={vertical ? 'w-5 h-5' : 'w-6 h-6 sm:w-7 sm:h-7'} />
      </Button>
    </div>
  );
};

export default NumberPad;
