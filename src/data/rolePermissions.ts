import { Role, RolePermissions } from '../types';

/**
 * EVER-Lab-OS 権限マトリックス
 * このファイルは、各役割がどのリソースに対して何のアクションを実行できるかを定義する
 * システム全体のアクセス制御の「信頼できる唯一の情報源（Single Source of Truth）」です。
 * 
 * スコープの説明:
 * - all: 全てのテナントのデータにアクセス可能。主に施設運営者向け。
 * - own_tenant: 自分が所属するテナントのデータにのみアクセス可能。テナントの管理者向け。
 * - own_only: 自分が直接作成した、または自分に割り当てられたデータにのみアクセス可能。一般研究員やサプライヤー向け。
 */

export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: Role.FacilityDirector,
    permissions: [
      // 施設責任者は、システムの全てのリソースに対して全ての操作（作成、読み取り、更新、削除、承認、管理）が可能。
      // これにより、システム全体の監督と最終的な意思決定を行うことができる。
      { resource: 'reservation', action: 'manage', scope: 'all' },
      { resource: 'equipment', action: 'manage', scope: 'all' },
      { resource: 'inventory', action: 'manage', scope: 'all' },
      { resource: 'sds', action: 'manage', scope: 'all' },
      { resource: 'billing', action: 'manage', scope: 'all' },
      { resource: 'users', action: 'manage', scope: 'all' },
      { resource: 'projects', action: 'manage', scope: 'all' },
      { resource: 'quotations', action: 'manage', scope: 'all' },
      { resource: 'audit', action: 'read', scope: 'all' },
      { resource: 'settings', action: 'manage', scope: 'all' },
      { resource: 'moneyforward', action: 'manage', scope: 'all' },
      { resource: 'manuals', action: 'manage', scope: 'all' },
    ],
  },
  
  {
    role: Role.LabManager,
    permissions: [
      // ラボマネージャーは日常のラボ運営に必要なほとんどの権限を持つが、
      // 重要な財務情報やユーザーアカウントの完全な削除など、一部の破壊的な操作は制限される。
      { resource: 'reservation', action: 'manage', scope: 'all' },
      { resource: 'equipment', action: 'manage', scope: 'all' },
      { resource: 'inventory', action: 'manage', scope: 'all' },
      { resource: 'sds', action: 'manage', scope: 'all' },
      
      // 請求書は閲覧のみ可能。作成や編集は財務責任を持つ施設責任者に限定される。
      { resource: 'billing', action: 'read', scope: 'all' },
      
      // ユーザーの削除は不可。誤操作によるデータ損失を防ぐため、無効化までの権限とする。
      { resource: 'users', action: 'create', scope: 'all' },
      { resource: 'users', action: 'read', scope: 'all' },
      { resource: 'users', action: 'update', scope: 'all' },
      
      { resource: 'projects', action: 'read', scope: 'all' },
      { resource: 'quotations', action: 'read', scope: 'all' },
      
      // 監査ログとMF設定は機微情報を含むため閲覧のみ。
      { resource: 'audit', action: 'read', scope: 'all' },
      { resource: 'moneyforward', action: 'read', scope: 'all' },
      { resource: 'settings', action: 'read', scope: 'all' }, // 一般設定も閲覧のみ
      { resource: 'manuals', action: 'manage', scope: 'all' },
    ],
  },
  
  {
    role: Role.ProjectManager,
    permissions: [
      // プロジェクトマネージャーは、自社テナント内のリソースに対する管理者。
      // 他のテナントの情報にはアクセスできないようにスコープが'own_tenant'に限定される。
      { resource: 'reservation', action: 'manage', scope: 'own_tenant' },
      { resource: 'equipment', action: 'read', scope: 'all' }, // 機器マスタは全体を閲覧可能
      { resource: 'inventory', action: 'manage', scope: 'own_tenant' },
      { resource: 'sds', action: 'manage', scope: 'own_tenant' },
      { resource: 'billing', action: 'read', scope: 'own_tenant' }, // 自社の請求書のみ閲覧
      { resource: 'users', action: 'manage', scope: 'own_tenant' }, // 自社のメンバー管理
      { resource: 'projects', action: 'manage', scope: 'own_tenant' },
      { resource: 'quotations', action: 'manage', scope: 'own_tenant' },
      { resource: 'manuals', action: 'read', scope: 'own_tenant' },
    ],
  },
  
  {
    role: Role.Researcher,
    permissions: [
      // 一般研究員は、自分の研究活動に直接必要な操作のみが許可される。
      // スコープは主に'own_only'となり、他人のデータへのアクセスは厳しく制限される。
      { resource: 'reservation', action: 'manage', scope: 'own_only' }, // 自分の予約のみ管理
      { resource: 'equipment', action: 'read', scope: 'all' },
      { resource: 'inventory', action: 'read', scope: 'own_tenant' }, // 在庫の閲覧はテナント全体
      { resource: 'inventory', action: 'update', scope: 'own_only' }, // 在庫の使用記録（更新）は自分に紐づく操作のみ
      { resource: 'sds', action: 'read', scope: 'own_tenant' },
      { resource: 'sds', action: 'create', scope: 'own_only' }, // 自分のSDS提出
      { resource: 'projects', action: 'read', scope: 'own_tenant' }, // 所属プロジェクトの閲覧
      { resource: 'manuals', action: 'read', scope: 'own_tenant' },
      // 請求書やユーザー管理機能へのアクセス権はない
    ],
  },
  
  {
    role: Role.Supplier,
    permissions: [
      // サプライヤーは、自社に関連する見積もりや問い合わせへの対応など、
      // 極めて限定的な機能のみにアクセスが許可される。
      { resource: 'quotations', action: 'update', scope: 'own_only' }, // 自分宛の見積もりに回答
      { resource: 'quotations', action: 'read', scope: 'own_only' },
    ],
  },
];