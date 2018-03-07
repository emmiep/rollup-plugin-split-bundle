import typescript from 'rollup-plugin-typescript2';
import npmPackage from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: npmPackage.main,
      format: 'cjs'
    },
    {
      file: npmPackage.module,
      format: 'es'
    }
  ],
  plugins: [
    typescript()
  ]
};

