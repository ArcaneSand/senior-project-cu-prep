"use server";

import { db } from "@/firebase/admin";
import { StoredEvaluation } from "@/types/evaluation";
import { serializeFirestoreDoc } from "@/lib/utils/serialize";

const COLLECTION = "evaluations";

/**
 * Save evaluation to Firestore
 */
export async function saveEvaluation(
  evaluation: Omit<StoredEvaluation, "id">
): Promise<string> {
  console.log('[createFeedback] Saving to Firestore:', {
    interviewId: evaluation.interviewId,
    userId: evaluation.userId,
    overallScore: evaluation.overallScore,
  });
  let ref;
  try {
    ref = await db.collection(COLLECTION).add(evaluation);
    console.log('[createFeedback] Saved successfully:', ref.id);
  } catch (error) {
    console.error('[createFeedback] FAILED to save:', error);
    throw error;
  }
  return ref.id;
}

/**
 * Get evaluation by ID
 */
export async function getEvaluationById(
  id: string
): Promise<StoredEvaluation | null> {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return serializeFirestoreDoc<StoredEvaluation>({ id: doc.id, ...doc.data() });
}

/**
 * Get evaluation for an interview (single document — per-interview model)
 */
export async function getEvaluationByInterview(
  interviewId: string
): Promise<StoredEvaluation | null> {
  const snapshot = await db
    .collection(COLLECTION)
    .where("interviewId", "==", interviewId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return serializeFirestoreDoc<StoredEvaluation>({ id: doc.id, ...doc.data() });
}
