// «1 libro», «12 libros»: el número con su palabra en singular o plural.
export const formatCount = (
  count: number,
  singular: string,
  plural: string,
): string => `${count} ${count === 1 ? singular : plural}`;
