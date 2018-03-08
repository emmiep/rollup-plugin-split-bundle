import {InputOptions, OutputOptions} from 'rollup';
import {Modules} from './modules';

export interface RollupOptions extends InputOptions {
  output?: OutputOptions;
}

export interface SharedOptions {
  name: string,
  modules: Modules
}

export const defaultSharedOptions: SharedOptions = {
  name: 'vendor',
  modules: {}
};

