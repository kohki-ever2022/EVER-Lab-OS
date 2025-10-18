import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const getEquipment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '認証が必要です');
  }

  const { category, status } = data;
  const db = admin.firestore();
  let query: admin.firestore.Query = db.collection('equipment');

  if (category) {
    query = query.where('category', '==', category);
  }
  if (status) {
    query = query.where('status', '==', status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
