import {
  ModuleName,
  type ModuleNameValue,
} from '@/progress/domain/module-name';
import { MotherCreator } from '../../shared/domain/mother-creator';

const MODULE_NAME_VALUES: ModuleNameValue[] = [
  'native_sounds',
  'connected_speech',
  'flow_connectors',
  'real_talk',
];

export class ModuleNameMother {
  static random(): ModuleName {
    const value =
      MotherCreator.random().helpers.arrayElement(MODULE_NAME_VALUES);
    return ModuleName.create(value);
  }

  static create(value: string): ModuleName {
    return ModuleName.create(value);
  }

  static nativeSounds(): ModuleName {
    return ModuleName.create('native_sounds');
  }

  static connectedSpeech(): ModuleName {
    return ModuleName.create('connected_speech');
  }
}
