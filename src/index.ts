import * as Rollup from 'rollup';

interface ExtendedOptions extends Rollup.InputOptions {
  output?: Rollup.OutputOptions;
}

type Modules = { [name: string]: string };

interface SharedOptions {
  name: string,
  modules: Modules
}

const defaultSharedOptions: SharedOptions = {
  name: 'vendor',
  modules: {}
};

interface ConsumerOptions extends SharedOptions {}
type PartialConsumerOptions = {
  [K in keyof ConsumerOptions]?: ConsumerOptions[K]
};

const defaultConsumerOptions: ConsumerOptions = Object.assign({}, defaultSharedOptions);

export function consumer(consumerOptions?: PartialConsumerOptions): Rollup.Plugin {
  const mergedOptions: ConsumerOptions = Object.assign({}, defaultConsumerOptions, consumerOptions);

  return {
    name: 'splitBundle.consumer',

    options(opts: ExtendedOptions) {
      const {modules, name} = mergedOptions;
      const prefixedModules = prefixModuleExports(modules, name);
      const moduleNames = getModuleNames(modules);

      updateDeep(opts, 'output.globals', (globals: Modules) => Object.assign(globals, prefixedModules), {});
      updateDeep(opts, 'external', (external: string[]) => external.push(...moduleNames), []);
    }
  };
}

interface ProducerOptions extends SharedOptions {}
type PartialProducerOptions = {
  [K in keyof ProducerOptions]?: ProducerOptions[K]
};

const defaultProducerOptions: ProducerOptions = Object.assign({}, defaultSharedOptions);

export function producer(producerOptions?: PartialProducerOptions): Rollup.Plugin {
  const mergedOptions: ProducerOptions = Object.assign({}, defaultProducerOptions, producerOptions);
  let firstLoad = true;

  return {
    name: 'splitBundle.producer',

    options(opts: ExtendedOptions) {
      const {name} = mergedOptions;

      updateDeep(opts, 'output.name', name);
    },

    load(id) {
      if (firstLoad) {
        firstLoad = false;
        return modulesToSource(mergedOptions.modules);
      }
    }
  };
}

function getModuleNames(modules: Modules): string[] {
  return Object.keys(modules);
}

function prefixModuleExports(modules: Modules, prefix: string): Modules {
  const prefixedModules: Modules = {};

  for (const [moduleName, moduleExport] of Object.entries(modules)) {
    prefixedModules[moduleName] = `${prefix}.${moduleExport}`;
  }

  return prefixedModules;
}

function modulesToSource(modules: Modules) {
  return Array.from(Object.entries(modules))
    .map(([moduleName, exportName]) => `export {default as ${exportName}} from ${JSON.stringify(moduleName)};`)
    .join('\n');
}

type StringKeys<T = any> = { [key: string]: T };
type Updater = ((value: any) => void) | any;

function updateDeep(root: StringKeys, path: string, updater: Updater, defaultValue?: any) {
  const keys = path.split('.');
  const [targetKey] = keys.splice(-1);

  const target: StringKeys = keys.reduce((object, key) => {
    if (object && typeof object != 'object') {
      throw new Error(`Expected object, was ${typeof object}`);
    } else if (object && key in object) {
      return object[key];
    } else {
      return object[key] = {};
    }
  }, root);

  const value = (typeof target[targetKey] != 'undefined' && target[targetKey] != null) ? target[targetKey] : defaultValue;

  if (typeof updater == 'function') {
    target[targetKey] = value;
    updater(value);
  } else {
    target[targetKey] = updater;
  }
}

