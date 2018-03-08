import {Plugin} from 'rollup';
import {RollupOptions, SharedOptions, defaultSharedOptions} from './options';
import {Modules, prefixModuleExports, getModuleNames, sanitizedModules} from './modules';
import {updateDeep} from './objects';

interface ConsumerOptions extends SharedOptions {}

type PartialConsumerOptions = {
  [K in keyof ConsumerOptions]?: ConsumerOptions[K]
};

const defaultConsumerOptions: ConsumerOptions = Object.assign({}, defaultSharedOptions);

export function consumer(consumerOptions?: PartialConsumerOptions): Plugin {
  const mergedOptions: ConsumerOptions = Object.assign({}, defaultConsumerOptions, consumerOptions);

  return {
    name: 'splitBundle.consumer',

    options(opts: RollupOptions) {
      const {modules, name} = mergedOptions;
      const prefixedModules = prefixModuleExports(sanitizedModules(modules), name);
      const moduleNames = getModuleNames(modules);

      updateDeep(opts, 'output.globals', (globals: Modules) => Object.assign(globals, prefixedModules), {});
      updateDeep(opts, 'external', (external: string[]) => external.push(...moduleNames), []);
    }
  };
}

