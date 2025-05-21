import { windowHandler } from './window-handler';

class C2RegistryHandler {
  private resolveMethods: Record<
    number,
    { resolve: (val: any) => void; reject: (val: any) => void }
  > = {};
  private index: number = 0;

  public async callRegistry(symbol: string, method: string, args: any[] = []) {
    windowHandler.getMainWebContents()?.openDevTools();
    const command = `window.registry.get('${symbol}')?.['${method}']?.(${args
      ?.map((a) => JSON.stringify(a))
      .join(',')})`;
    console.log(command);
    return windowHandler.getMainWebContents()?.executeJavaScript(command);

    // Maybe later if we want to do it clean
    // return new Promise<any>((resolve, reject) => {
    //   const id = this.index++;
    //   this.resolveMethods[id] = { resolve, reject };
    //   windowHandler
    //     .getMainWebContents()
    //     ?.send('registry-call', id, symbol, method, args);
    // });
  }

  //   public async resolveRegistryResponse(
  //     id: number,
  //     result: any,
  //     errorReason: string,
  //   ) {
  //     if (errorReason) {
  //       this.resolveMethods[id]?.reject(errorReason);
  //     } else {
  //       this.resolveMethods[id]?.resolve(result);
  //     }
  //     delete this.resolveMethods[id];
  //   }
}

export const c2RegistryHandler = new C2RegistryHandler();
