import * as Rollup from 'rollup';

interface ExtendedOptions extends Rollup.InputOptions {
  output?: Rollup.OutputOptions;
}

type Modules = { [name: string]: string };

interface SharedOptions {
  name?: string,
  modules?: Modules
}

const defaultSharedOptions: SharedOptions = {
  name: 'vendor'
};

interface ConsumerOptions extends SharedOptions {}

const defaultConsumerOptions: ConsumerOptions = Object.assign({}, defaultSharedOptions);

export function consumer(consumerOptions?: ConsumerOptions): Rollup.Plugin {
  const mergedOptions = Object.assign({}, defaultConsumerOptions, consumerOptions);

  return {
    name: 'splitBundle.consumer',

    options(opts: ExtendedOptions) {
      opts.output = Object.assign(opts.output || {}, {
        name: mergedOptions.name,
        globals: Object.assign(opts.output && opts.output.globals || {}, prefixModuleExports(mergedOptions.modules!, mergedOptions.name!))
      });

      opts.external = (opts.external as string[] || []).concat(getModuleNames(mergedOptions.modules!));
    }
  };
}

interface ProducerOptions extends SharedOptions {}

const defaultProducerOptions: ProducerOptions = Object.assign({}, defaultSharedOptions);

export function producer(producerOptions?: ProducerOptions): Rollup.Plugin {
  const mergedOptions = Object.assign({}, defaultProducerOptions, producerOptions);
  let firstLoad = true;

  return {
    name: 'splitBundle.producer',

    options(opts: ExtendedOptions) {
      opts.output = Object.assign(opts.output || {}, {
        name: mergedOptions.name
      });
    },

    load(id) {
      if (firstLoad) {
        firstLoad = false;
        return modulesToSource(mergedOptions.modules!);
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

