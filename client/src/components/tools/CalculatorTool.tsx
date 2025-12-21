import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Delete, Equal } from 'lucide-react';

export default function CalculatorTool() {
  const { t } = useTranslation();
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (operator: string) => {
    const current = parseFloat(display);
    
    if (expression && !waitingForOperand) {
      const prev = parseFloat(expression.split(' ')[0]);
      const op = expression.split(' ')[1];
      let result = current;
      
      switch (op) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '*': result = prev * current; break;
        case '/': result = current !== 0 ? prev / current : 0; break;
      }
      
      setDisplay(String(result));
      setExpression(`${result} ${operator}`);
    } else {
      setExpression(`${current} ${operator}`);
    }
    
    setWaitingForOperand(true);
  };

  const calculate = () => {
    if (!expression || waitingForOperand) return;
    
    const prev = parseFloat(expression.split(' ')[0]);
    const op = expression.split(' ')[1];
    const current = parseFloat(display);
    let result = current;
    
    switch (op) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '*': result = prev * current; break;
      case '/': result = current !== 0 ? prev / current : 0; break;
    }
    
    setDisplay(String(result));
    setExpression('');
    setWaitingForOperand(true);
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  };

  const percentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const buttons = [
    { label: 'C', action: clear, variant: 'secondary' as const },
    { label: '+/-', action: toggleSign, variant: 'secondary' as const },
    { label: '%', action: percentage, variant: 'secondary' as const },
    { label: '÷', action: () => performOperation('/'), variant: 'default' as const },
    { label: '7', action: () => inputDigit('7'), variant: 'outline' as const },
    { label: '8', action: () => inputDigit('8'), variant: 'outline' as const },
    { label: '9', action: () => inputDigit('9'), variant: 'outline' as const },
    { label: '×', action: () => performOperation('*'), variant: 'default' as const },
    { label: '4', action: () => inputDigit('4'), variant: 'outline' as const },
    { label: '5', action: () => inputDigit('5'), variant: 'outline' as const },
    { label: '6', action: () => inputDigit('6'), variant: 'outline' as const },
    { label: '-', action: () => performOperation('-'), variant: 'default' as const },
    { label: '1', action: () => inputDigit('1'), variant: 'outline' as const },
    { label: '2', action: () => inputDigit('2'), variant: 'outline' as const },
    { label: '3', action: () => inputDigit('3'), variant: 'outline' as const },
    { label: '+', action: () => performOperation('+'), variant: 'default' as const },
    { label: '0', action: () => inputDigit('0'), variant: 'outline' as const, span: 2 },
    { label: '.', action: inputDecimal, variant: 'outline' as const },
    { label: '=', action: calculate, variant: 'default' as const },
  ];

  return (
    <div className="max-w-sm mx-auto">
      <Card className="p-4">
        <div className="bg-muted rounded-lg p-4 mb-4">
          <p className="text-right text-sm text-muted-foreground h-5">{expression}</p>
          <p className="text-right text-4xl font-mono font-bold truncate" data-testid="display">
            {display}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {buttons.map((btn, i) => (
            <Button
              key={i}
              variant={btn.variant}
              className={`h-14 text-xl font-medium ${btn.span === 2 ? 'col-span-2' : ''}`}
              onClick={btn.action}
              data-testid={`button-${btn.label}`}
            >
              {btn.label}
            </Button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={backspace} data-testid="button-backspace">
            <Delete className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
