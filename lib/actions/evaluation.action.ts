"use server";

import { db } from "@/firebase/admin";
import { StoredEvaluation } from "@/types/evaluation";

const COLLECTION = "evaluations";

export async function saveEvaluation(
  evaluation: Omit<StoredEvaluation, "id">
): Promise<string> {
  const ref = await db.collection(COLLECTION).add(evaluation);
  return ref.id;
}

export async function getEvaluationById(
  id: string
): Promise<StoredEvaluation | null> {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as StoredEvaluation;
}

export async function getEvaluationsByInterview(
  interviewId: string
): Promise<StoredEvaluation[]> {
  const snapshot = await db
    .collection(COLLECTION)
    .where("interviewId", "==", interviewId)
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as StoredEvaluation)
  );
}
