// src/utils/uuid.ts
export const simpleUUID = () =>
  `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
