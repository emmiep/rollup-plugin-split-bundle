# @emmiep/rollup-plugin-split-bundle

Experimental Rollup plugin to split the code into separate bundles, for instance to create a "vendor bundle" with external npm packages.
This is *not* code splitting for asynchronous loading with dynamic imports, such as [using webpack and and `import()`](https://webpack.js.org/guides/code-splitting/#dynamic-imports).
**Use on your own risk**, not tested and not recommended for production code!

## Usage

Installation:

```sh
npm install @emmiep/rollup-plugin-split-bundle
```

The plugin requires two rollup configurations, one for the main bundle (the "consumer" side) and one for the split bundle (the "producer" side).

First, use the `consumer()` plugin in the main bundle configuration (`rollup.main.js`):

```js
import splitBundle from '@emmiep/rollup-plugin-split-bundle';

export default {
  input: 'src/index.js'
  output: {
    file: 'dist/app.js'
    format: 'umd',
    name: 'app'
  },
  plugins: [
    splitBundle.consumer({
      name: '__vendor',
      modules: [
        'react',
        'react-dom'
      ]
    })
  ]
};
```

Then, use `producerFromConfig()` in the split bundle configuration (`rollup.vendor.js`) with the main bundle configuration:

```js
import splitBundle from '@emmiep/rollup-plugin-split-bundle';
import mainConfig from './rollup.main';

export default {
  output: {
    file: 'dist/vendor.js'
    format: 'umd',
    name: 'vendor'
  },
  plugins: [
    splitBundle.producerFromConfig(mainConfig)
  ]
};
```

Then invoke `rollup` with both configuration files:

```sh
rollup -c rollup.main.js
rollup -c rollup.vendor.js
```

## Background

The idea behind the plugin is straightforward and can easily be done manually as well.

The consumer prevents the listed modules from being included in bundle by declaring them as [`external`](https://rollupjs.org/guide/en#peer-dependencies), and map their module IDs to properties on a global variable (e.g. `window.__vendor`) using [`output.globals`](https://rollupjs.org/guide/en#globals-g-globals).
The name of the global variable is set by the `name` plugin option.

On the other hand, the producer simply sets `output.name` to the same name as the global variable, and replaces the entrypoint with a script [re-exporting](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export) the modules so the main bundle can access them:

```sh
export {default as React} from 'react';
export {default as ReactDom} from 'react-dom';
```

