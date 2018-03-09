import {Plugin} from 'rollup';
import {RollupOptions, SharedOptions, defaultSharedOptions} from './options';
import {Modules, prefixModuleExports, getModuleNames, sanitizedModules} from './modules';
import {updateDeep} from './objects';

export interface ConsumerOptions extends SharedOptions {}

type PartialConsumerOptions = {
  [K in keyof ConsumerOptions]?: ConsumerOptions[K]
};

export interface ConsumerPlugin extends Plugin {
  _consumerOptions: ConsumerOptions
}

const defaultConsumerOptions: ConsumerOptions = Object.assign({}, defaultSharedOptions);

export const pluginName = 'splitBundle.consumer';

export function consumer(consumerOptions?: PartialConsumerOptions): ConsumerPlugin {
  const mergedOptions: ConsumerOptions = Object.assign({}, defaultConsumerOptions, consumerOptions);

  return {
    name: pluginName,

    options(opts: RollupOptions) {
      const {modules, name} = mergedOptions;
      const prefixedModules = prefixModuleExports(sanitizedModules(modules), name);
      const moduleNames = getModuleNames(modules);

      updateDeep(opts, 'output.globals', (globals: Modules) => Object.assign(globals, prefixedModules), {});
      updateDeep(opts, 'external', (external: string[]) => external.push(...moduleNames), []);
    },

    _consumerOptions: mergedOptions
  };
}

