// src/i18n/locales/index.ts
import { admin } from './admin';
import { common } from './common';
import { compliance } from './compliance';
import { equipment } from './equipment';
import { inventory } from './inventory';
import { layout } from './layout';
import { project } from './project';
import { user } from './user';

export const allTranslations = {
  ...admin,
  ...common,
  ...compliance,
  ...equipment,
  ...inventory,
  ...layout,
  ...project,
  ...user,
};
