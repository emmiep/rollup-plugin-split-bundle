type StringKeys<T = any> = { [key: string]: T };
type Updater = ((value: any) => void) | any;

export function updateDeep(root: StringKeys, path: string, updater: Updater, defaultValue?: any) {
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

