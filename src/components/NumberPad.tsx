import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface NumberPadProps {
  onNumberClick: (num: number | null) => void;
}

const NumberPad = ({ onNumberClick }: NumberPadProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-xs mx-auto animate-fade-in">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button
          key={num}
          onClick={() => onNumberClick(num)}
          variant="outline"
          size="lg"
          className="w-12 h-12 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
        >
          {num}
        </Button>
      ))}
      <Button
        onClick={() => onNumberClick(null)}
        variant="outline"
        size="lg"
        className="w-12 h-12 hover:bg-destructive hover:text-destructive-foreground transition-all"
      >
        <Eraser className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default NumberPad;
