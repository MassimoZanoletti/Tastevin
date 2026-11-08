import pkg from '../../package.json';

/** Dati di versione letti da package.json al momento della compilazione. */
export const BUILD_INFO = {
  version: pkg.version as string,
  compileDate: (pkg as Record<string, unknown>)['compile-date'] as string,
  author: pkg.author as string,
};
