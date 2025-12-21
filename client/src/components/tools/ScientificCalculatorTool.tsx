import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

export default function ScientificCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.scientific-calculator.${key}`);

  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number | null>(null);
  const [isRadians, setIsRadians] = useState(true);

  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const toDegrees = (rad: number) => (rad * 180) / Math.PI;

  const calculate = (expression: string): string => {
    try {
      let expr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, String(Math.PI))
        .replace(/e(?![x])/g, String(Math.E));

      expr = expr.replace(/sin\(([^)]+)\)/g, (_, n) => {
        const val = parseFloat(n);
        return String(Math.sin(isRadians ? val : toRadians(val)));
      });
      expr = expr.replace(/cos\(([^)]+)\)/g, (_, n) => {
        const val = parseFloat(n);
        return String(Math.cos(isRadians ? val : toRadians(val)));
      });
      expr = expr.replace(/tan\(([^)]+)\)/g, (_, n) => {
        const val = parseFloat(n);
        return String(Math.tan(isRadians ? val : toRadians(val)));
      });
      expr = expr.replace(/ln\(([^)]+)\)/g, (_, n) => String(Math.log(parseFloat(n))));
      expr = expr.replace(/log\(([^)]+)\)/g, (_, n) => String(Math.log10(parseFloat(n))));
      expr = expr.replace(/√\(([^)]+)\)/g, (_, n) => String(Math.sqrt(parseFloat(n))));
      expr = expr.replace(/(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g, (_, a, b) => String(Math.pow(parseFloat(a), parseFloat(b))));
      expr = expr.replace(/(\d+(?:\.\d+)?)!/g, (_, n) => {
        let result = 1;
        for (let i = 2; i <= parseInt(n); i++) result *= i;
        return String(result);
      });

      const result = new Function('return ' + expr)();
      return Number.isFinite(result) ? String(result) : 'Error';
    } catch {
      return 'Error';
    }
  };

  const handleInput = (value: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
  };

  const handleOperator = (op: string) => {
    if (display !== 'Error') {
      setDisplay(display + op);
    }
  };

  const handleFunction = (fn: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(fn + '(');
    } else {
      setDisplay(display + fn + '(');
    }
  };

  const handleEquals = () => {
    const result = calculate(display);
    setDisplay(result);
  };

  const handleClear = () => setDisplay('0');
  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const buttons = [
    ['(', ')', 'sin', 'cos', 'tan'],
    ['7', '8', '9', '÷', 'ln'],
    ['4', '5', '6', '×', 'log'],
    ['1', '2', '3', '-', '√'],
    ['0', '.', '^', '+', '='],
  ];

  const btnClass = (btn: string) => {
    if (btn === '=') return 'bg-primary text-primary-foreground';
    if (['÷', '×', '-', '+', '^'].includes(btn)) return 'bg-muted';
    if (['sin', 'cos', 'tan', 'ln', 'log', '√'].includes(btn)) return 'bg-muted';
    return '';
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRadians(!isRadians)}
              data-testid="btn-mode"
            >
              {isRadians ? 'RAD' : 'DEG'}
            </Button>
            <div className="text-xs text-muted-foreground">
              {memory !== null && `M: ${memory}`}
            </div>
          </div>
          <div
            className="text-right text-3xl font-mono p-4 bg-muted rounded-md overflow-x-auto"
            data-testid="display"
          >
            {display}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-5 gap-2 mb-2">
            <Button variant="outline" onClick={handleClear} data-testid="btn-clear">C</Button>
            <Button variant="outline" onClick={handleBackspace} data-testid="btn-backspace">
              <Delete className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => handleInput('π')} data-testid="btn-pi">π</Button>
            <Button variant="outline" onClick={() => handleInput('e')} data-testid="btn-e">e</Button>
            <Button variant="outline" onClick={() => handleInput('!')} data-testid="btn-factorial">n!</Button>
          </div>

          {buttons.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-5 gap-2 mb-2">
              {row.map((btn) => (
                <Button
                  key={btn}
                  variant="outline"
                  className={btnClass(btn)}
                  onClick={() => {
                    if (btn === '=') handleEquals();
                    else if (['sin', 'cos', 'tan', 'ln', 'log', '√'].includes(btn)) handleFunction(btn);
                    else if (['÷', '×', '-', '+', '^'].includes(btn)) handleOperator(btn);
                    else handleInput(btn);
                  }}
                  data-testid={`btn-${btn}`}
                >
                  {btn}
                </Button>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
