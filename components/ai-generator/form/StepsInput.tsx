'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface StepsInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  description?: string;
  id?: string;
}

export default function StepsInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  label = '步数',
  description,
  id = 'steps',
}: StepsInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        className="w-full"
      />
      <div className="flex justify-between text-sm font-medium text-foreground">
        <span>{min}</span>
        <span>~</span>
        <span>{max}</span>
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
