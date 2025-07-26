
import { type DataEntryMap } from "astro:content";

export function getAssociativeCollection<Item extends {}>(
  collection: Item[],
  key: keyof Item,
): { [id in typeof key]: Item } {
  return Object.fromEntries(
    collection.map((item) => [item[key], item])
  );
}

export function mapEntries<K extends string | number | symbol, V, R>(rec: Partial<Record<K, V>>, mapFn: (k: K, v: V) => R): R[] {
  const result: R[] = []
  for (const k in rec) {
    if (rec[k]){
      result.push(mapFn(k, rec[k]))
    }
  }
  return result
}