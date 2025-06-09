import { logger } from '../common/logger';
import { clean } from '../common/utils';
import { windowHandler } from './window-handler';

class C2RegistryHandler {
  /**
   * Call C2 registry services
   * @param symbol registry symbols string with which the target service has been registered
   * @param method service method to be called
   * @param args arguments the method should take as parameters
   * @returns
   */
  public async callRegistry(symbol: string, method: string, args: any[] = []) {
    const command = `window.registry.get('${symbol}')?.['${method}']?.(${args
      ?.map((a) => JSON.stringify(a))
      .join(',')})`;

    logger.info(command);

    // requires thrown errors to be converted to strings (for ipc renderer)
    // wrap non-promise results in Promise.resolve() and ensure the result is serializable (handle circular structure, functions, etc.)
    const sandboxedCall = `Promise.resolve(${command}).then(obj => (obj === undefined || obj === null) ? obj : JSON.parse(JSON.stringify(obj, (key, value) => value instanceof Object && (value.constructor !== Object && value.constructor !== Array) ? null : value) || '{}')) .catch((e) => e.message || 'false')`;

    return windowHandler
      .getMainWebContents()
      ?.executeJavaScript(sandboxedCall)
      .then(clean);
  }
}
export const c2RegistryHandler = new C2RegistryHandler();
