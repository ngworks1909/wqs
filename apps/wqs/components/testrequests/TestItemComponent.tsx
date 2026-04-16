'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

interface Test {
  testId: string;
  name: string;
  description: string;
  price: number;
}

interface TestItemComponentProps {
  test: Test;
  isSelected: boolean;
  onToggle: () => void;
}

export function TestItemComponent({
  test,
  isSelected,
  onToggle,
}: TestItemComponentProps) {
  return (
    <Card
      className="flex gap-4 border border-border p-4 transition-all hover:shadow-md cursor-pointer"
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div className="flex items-start pt-1">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          aria-label={`Select ${test.name} test`}
        />
      </div>

      {/* Test Details */}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{test.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{test.description}</p>
      </div>

      {/* Amount - Pinned to top-right */}
      <div className="flex items-start">
        <p className="text-lg font-bold text-primary whitespace-nowrap">
          ₹{test.price.toFixed(2)}
        </p>
      </div>
    </Card>
  );
}
