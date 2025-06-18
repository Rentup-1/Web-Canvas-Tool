export const transformElementsKeys = (
  elements: any[],
  keyMapping: Record<string, string>
): any[] => {
  return elements.map((element) => {
    const transformed: any = {};

    for (const key in element) {
      const newKey = keyMapping[key] || key;
      transformed[newKey] = element[key];
    }

    return transformed;
  });
};
