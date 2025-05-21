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
    windowHandler.getMainWebContents()?.openDevTools();
    const command = `window.registry.get('${symbol}')?.['${method}']?.(${args
      ?.map((a) => JSON.stringify(a))
      .join(',')})`;
    logger.info(command);
    return windowHandler.getMainWebContents()?.executeJavaScript(command);
  }
}

export const c2RegistryHandler = new C2RegistryHandler();
