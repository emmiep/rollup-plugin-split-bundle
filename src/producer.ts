import {Plugin} from 'rollup';
import {RollupOptions, SharedOptions, defaultSharedOptions} from './options';
import {modulesToSource, sanitizedModules} from './modules';
import {updateDeep} from './objects';

interface ProducerOptions extends SharedOptions {}

type PartialProducerOptions = {
  [K in keyof ProducerOptions]?: ProducerOptions[K]
};

const defaultProducerOptions: ProducerOptions = Object.assign({}, defaultSharedOptions);

export function producer(producerOptions?: PartialProducerOptions): Plugin {
  const mergedOptions: ProducerOptions = Object.assign({}, defaultProducerOptions, producerOptions);
  let firstLoad = true;

  return {
    name: 'splitBundle.producer',

    options(opts: RollupOptions) {
      const {name} = mergedOptions;

      updateDeep(opts, 'output.name', name);
    },

    load(id) {
      if (firstLoad) {
        firstLoad = false;
        return modulesToSource(sanitizedModules(mergedOptions.modules));
      }
    }
  };
}

