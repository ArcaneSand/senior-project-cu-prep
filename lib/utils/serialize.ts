/**
 * Firestore serialization helpers
 * Converts Timestamp objects to ISO strings so data is safe to pass to Client Components
 */

function convertTimestamp(timestamp: unknown): string {
  if (!timestamp) return new Date().toISOString();

  if (typeof timestamp === "string") return timestamp;

  if (
    typeof timestamp === "object" &&
    timestamp !== null &&
    "_seconds" in timestamp
  ) {
    return new Date(
      (timestamp as { _seconds: number })._seconds * 1000
    ).toISOString();
  }

  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }

  return new Date().toISOString();
}

/**
 * Recursively serialize a Firestore document so it contains only plain objects.
 * Converts Timestamp instances to ISO strings.
 */
export function serializeFirestoreDoc<T = unknown>(doc: unknown): T {
  if (!doc) return doc as T;

  if (Array.isArray(doc)) {
    return doc.map((item) => serializeFirestoreDoc(item)) as T;
  }

  if (typeof doc !== "object") {
    return doc as T;
  }

  const serialized: Record<string, unknown> = {};

  for (const key in doc as Record<string, unknown>) {
    const value = (doc as Record<string, unknown>)[key];

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      "_seconds" in (value as object)
    ) {
      serialized[key] = convertTimestamp(value);
    } else if (Array.isArray(value)) {
      serialized[key] = value.map((item) => serializeFirestoreDoc(item));
    } else if (value && typeof value === "object") {
      serialized[key] = serializeFirestoreDoc(value);
    } else {
      serialized[key] = value;
    }
  }

  return serialized as T;
}
