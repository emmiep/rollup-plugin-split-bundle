import {Plugin} from 'rollup';
import {ConsumerOptions, pluginName as consumerPluginName, ConsumerPlugin} from './consumer';
import {RollupOptions, SharedOptions, defaultSharedOptions} from './options';
import {modulesToSource, sanitizedModules} from './modules';
import {updateDeep} from './objects';

export interface ProducerOptions extends SharedOptions {
  fallbackInputPath?: RollupOptions['input']
}

type PartialProducerOptions = {
  [K in keyof ProducerOptions]?: ProducerOptions[K]
};

const defaultProducerOptions: ProducerOptions = Object.assign({}, defaultSharedOptions);

export const pluginName = 'splitBundle.producer';

export function producer(producerOptions?: PartialProducerOptions): Plugin {
  const mergedOptions: ProducerOptions = Object.assign({}, defaultProducerOptions, producerOptions);
  let firstLoad = true;

  return {
    name: pluginName,

    options(opts: RollupOptions) {
      const {name, fallbackInputPath} = mergedOptions;

      updateDeep(opts, 'output.name', name);

      if (typeof fallbackInputPath != 'undefined' && typeof opts.input == 'undefined') {
        opts.input = fallbackInputPath;
      }
    },

    load(id) {
      if (firstLoad) {
        firstLoad = false;
        return modulesToSource(sanitizedModules(mergedOptions.modules));
      }
    }
  };
}

export function producerFromConfig(config: RollupOptions): Plugin {
  const fallbackInputPath = config.input;
  const consumerOptions = getConsumerOptions(config);

  if (!consumerOptions) {
    throw new Error('Consumer plugin not found');
  }

  const producerOptions: ProducerOptions = Object.assign({}, consumerOptions, {fallbackInputPath});
  return producer(producerOptions);
}

function getConsumerOptions(config: RollupOptions): ConsumerOptions | undefined {
  if (!config.plugins) {
    return undefined;
  }

  const plugin = config.plugins.find((plugin) => plugin.name === consumerPluginName);

  if (!plugin) {
    return undefined;
  }

  return (<ConsumerPlugin>plugin)._consumerOptions;
}

