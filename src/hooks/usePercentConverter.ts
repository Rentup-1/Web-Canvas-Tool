import { useCallback } from "react";

export function usePercentConverter() {
  const toPercent = useCallback((value: number, total: number) => {
    return Number(((value / total) * 100).toFixed(1)); // value of shape (width, height, x , y) -- total (width,height) of canvas elment
  }, []);

  const fromPercent = useCallback((percent: number, total: number) => {
    return (percent / 100) * total; // percent -- total canvas
  }, []);

  return { toPercent, fromPercent };
}

export function toPercentFontSize(fontSize: number, stageWidth: number, stageHeight: number) {
  const avg = (stageWidth + stageHeight) / 2;
  return Number(((fontSize / avg) * 100).toFixed(1));
}
