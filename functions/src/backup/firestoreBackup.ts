import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const client = new admin.firestore.v1.FirestoreAdminClient();

export const scheduledFirestoreBackup = functions.pubsub
  .schedule('0 2 * * *') // 毎日午前2時(JST)
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    if (!projectId) {
        console.error('GCP project ID not set.');
        return;
    }
    const timestamp = new Date().toISOString().split('T')[0];
    const bucket = `gs://${projectId}-firestore-backups`;
    
    const databaseName = client.databasePath(projectId, '(default)');
    
    try {
      const responses = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: `${bucket}/${timestamp}`,
        collectionIds: [], // Empty array means all collections
      });

      const operation = responses[0];
      console.log(`Backup operation name: ${operation.name}`);
      return { status: 'success', operation: operation.name };
      
    } catch (error) { 
      console.error('Backup failed:', error);
      if (error instanceof Error) {
        throw new functions.https.HttpsError('internal', error.message);
      } 
      throw new functions.https.HttpsError('internal', 'バックアップに失敗しました');
    }
  });
