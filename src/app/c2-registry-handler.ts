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
    // wrap non-promise results in Promise.resolve()
    const sandboxedCall = `Promise.resolve(${command}).catch((e) => e.message)`;

    return windowHandler
      .getMainWebContents()
      ?.executeJavaScript(sandboxedCall)
      .then(clean);
  }
}
export const c2RegistryHandler = new C2RegistryHandler();
