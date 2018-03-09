export type Modules = { [name: string]: string } | string[];

export function getModuleNames(modules: Modules): string[] {
  return (modules instanceof Array) ? modules : Object.keys(modules);
}

export function prefixModuleExports(modules: Modules, prefix: string): Modules {
  const prefixedModules: Modules = {};

  if (modules instanceof Array) {
    for (const moduleName of modules) {
      prefixedModules[moduleName] = `${prefix}[${moduleName}]`;
    }
  } else {
    for (const [moduleName, moduleExport] of Object.entries(modules)) {
      prefixedModules[moduleName] = `${prefix}.${moduleExport}`;
    }
  }

  return prefixedModules;
}

export function modulesToSource(modules: Modules) {
  if (modules instanceof Array) {
    throw new Error('modules should be an object');
  }

  return Array.from(Object.entries(modules))
    .map(([moduleName, exportName]) => `export {default as ${exportName}} from ${JSON.stringify(moduleName)};`)
    .join('\n');
}

export function sanitizedModules(modules: Modules) {
  if (modules instanceof Array) {
    const sanitizedModules: Modules = {};

    for (const moduleName of modules) {
      sanitizedModules[moduleName] = sanitizeExportName(moduleName);
    }

    return sanitizedModules;
  }

  return modules;
}

export function sanitizeExportName(moduleName: string): string {
  return moduleName
    .split(/[^a-zA-Z0-9_$]+/g)
    .map((part) => part.toLowerCase())
    .map((part) => part.replace(/^[a-z]/, (letter) => letter.toUpperCase()))
    .join('')
    .replace(/^([0-9])/, '_$1');
}

