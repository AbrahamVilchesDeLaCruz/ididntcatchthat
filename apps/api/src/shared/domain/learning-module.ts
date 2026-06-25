export enum LearningModule {
  NativeSounds = 'native_sounds',
  ConnectedSpeech = 'connected_speech',
  FlowConnectors = 'flow_connectors',
  RealTalk = 'real_talk',
}

export const LEARNING_MODULES = Object.values(LearningModule);

export type LocalizedLabel = { es: string; en: string };

export const LEARNING_MODULE_LABELS: Record<LearningModule, LocalizedLabel> = {
  [LearningModule.NativeSounds]: {
    es: 'Sonidos nativos',
    en: 'Native Sounds',
  },
  [LearningModule.ConnectedSpeech]: {
    es: 'Habla conectada',
    en: 'Connected Speech',
  },
  [LearningModule.FlowConnectors]: {
    es: 'Fluidez y conectores',
    en: 'Flow & Connectors',
  },
  [LearningModule.RealTalk]: {
    es: 'Inglés de calle',
    en: 'Real Talk',
  },
};
