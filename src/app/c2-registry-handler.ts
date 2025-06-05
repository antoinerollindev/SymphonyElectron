import { logger } from '../common/logger';
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
    const result = await windowHandler
      .getMainWebContents()
      ?.executeJavaScript(command);
    if (result === undefined) {
      return 'tool call successful';
    }
    return result;
  }
}

export const c2RegistryHandler = new C2RegistryHandler();
