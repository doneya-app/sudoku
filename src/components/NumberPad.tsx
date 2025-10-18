import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface NumberPadProps {
  onNumberClick: (num: number | null) => void;
  vertical?: boolean;
}

const NumberPad = ({ onNumberClick, vertical = false }: NumberPadProps) => {
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
