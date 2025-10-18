import { useColorScheme } from '@/contexts/ColorSchemeContext';
import { colorSchemes } from '@/utils/colorSchemes';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const ColorSchemeSelector = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Color Scheme</h4>
      <div className="grid grid-cols-2 gap-3">
        {colorSchemes.map((scheme) => (
          <button
            key={scheme.id}
            onClick={() => setColorScheme(scheme.id)}
            className={cn(
              "relative p-3 rounded-md border-2 transition-all hover:scale-105",
              colorScheme === scheme.id
                ? "border-primary bg-accent"
                : "border-border bg-card hover:border-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                {scheme.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {colorScheme === scheme.id && (
                <Check className="w-4 h-4 text-primary ml-auto" />
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">{scheme.name}</p>
              <p className="text-xs text-muted-foreground">{scheme.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorSchemeSelector;
