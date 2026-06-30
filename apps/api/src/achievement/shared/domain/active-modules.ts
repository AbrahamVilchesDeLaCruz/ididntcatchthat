export const ACTIVE_MODULES = [
  'native_sounds',
  'connected_speech',
  'flow_connectors',
  'real_talk',
] as const;

export type ActiveModule = (typeof ACTIVE_MODULES)[number];
