import { useMemo } from "react";

interface RentalCalculatorProps {
  day: number;
  price: number;
  deposit: number;
}

export function calcullateTotal({
  day,
  price,
  deposit,
}: RentalCalculatorProps) {
  if (day === 0 || price === 0) return 0;
  return day * price + deposit;
}
