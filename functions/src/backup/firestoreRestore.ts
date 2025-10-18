import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const client = new admin.firestore.v1.FirestoreAdminClient();

export const restoreFirestoreBackup = onCall(async (request) => {
  // Note: In a real app, you'd check for a specific admin role.
  if (!request.auth) {
    throw new HttpsError('permission-denied', '管理者権限が必要です');
  }

  const { backupDate, collectionIds } = request.data;
  if (!backupDate) {
    throw new HttpsError('invalid-argument', 'バックアップ日付を指定してください');
  }

  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  if (!projectId) {
    console.error('GCP project ID not set.');
    throw new HttpsError('internal', 'プロジェクトIDが設定されていません');
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
      throw new HttpsError('internal', error.message);
    }
    throw new HttpsError('internal', 'リストアに失敗しました');
  }
});
