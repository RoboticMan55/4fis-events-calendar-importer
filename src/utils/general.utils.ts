export function zip<T, U>(
  first: T[], 
  second: U[]
): { first: T, second: U }[] {
  const pairsCount = Math.min(first.length, second.length);
  
  return first.slice(0, pairsCount).map((item, i) => ({
    first: item,
    second: second[i]
  })) 
}
