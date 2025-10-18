import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const client = new admin.firestore.v1.FirestoreAdminClient();

export const restoreFirestoreBackup = functions.https.onCall(
  async (data, context) => {
    // Note: In a real app, you'd check for a specific admin role.
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'permission-denied',
        '管理者権限が必要です'
      );
    }

    const { backupDate, collectionIds } = data;
    if (!backupDate) {
        throw new functions.https.HttpsError('invalid-argument', 'バックアップ日付を指定してください');
    }

    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    if (!projectId) {
        console.error('GCP project ID not set.');
        throw new functions.https.HttpsError('internal', 'プロジェクトIDが設定されていません');
    }
    const bucket = `gs://${projectId}-firestore-backups`;
    
    const databaseName = client.databasePath(projectId, '(default)');
    
    try {
      const responses = await client.importDocuments({
        name: databaseName,
        inputUriPrefix: `${bucket}/${backupDate}`,
        collectionIds: collectionIds || [], // Empty array means all collections from the backup
      });

      const operation = responses[0];
      console.log(`Restore operation name: ${operation.name}`);
      return { status: 'success', operation: operation.name };
      
    } catch (error) {
      console.error('Restore failed:', error);
      if (error instanceof Error) {
        throw new functions.https.HttpsError('internal', error.message);
      }
      throw new functions.https.HttpsError('internal', 'リストアに失敗しました');
    }
  }
);
