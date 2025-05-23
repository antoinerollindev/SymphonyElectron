import { logger } from '../common/logger';
import { windowHandler } from './window-handler';

const SP_FDC3_APP_ID = 'symphony-fdc3';
const FDC3_ACTION_TIMEOUT_MS = 30000;

const FDC3_APP_NOT_INSTALLED_LOG = `The FDC3 action could not be executed because the Symphony FDC3 application is not installed`;
const FDC3_APP_NOT_INSTALLED_MSG = `${FDC3_APP_NOT_INSTALLED_LOG}. Please contact your Symphony administrator to install it.`;
const FDC3_ACTION_TIMEOUT_LOG = `The FDC3 action did not respond after ${FDC3_ACTION_TIMEOUT_MS} ms`;
const FDC3_ACTION_TIMEOUT_MSG = `${FDC3_ACTION_TIMEOUT_LOG}. Consider the FDC3 action successfully done.`;
const FDC3_ACTION_ERROR_LOG = 'The FDC3 action failed';
const FDC3_ACTION_ERROR_MSG = `${FDC3_ACTION_ERROR_LOG}. Please make sure the Symphony FDC3 application is properly configured and the action parameters are correct. Error: `;
const FDC3_ACTION_SUCCESS_MSG = 'The FDC3 action responded successfully with: ';

class FDC3Handler {
  /**
   * Calls the FDC3 Desktop agent with a provided method and arguments.
   * https://fdc3.finos.org/docs/api/ref/DesktopAgent
   *
   * @param methods the FDC3 api method to call
   * @param args arguments the method should take as parameters
   * @returns the message describing the result of the FDC3 api call
   */
  public async callDesktopAgent(method: string, args: any[] = []) {
    const mainWebContents = windowHandler.getMainWebContents();

    // retrieve the Symphony FDC3 frame that defines the FDC3 desktop agent (window.fdc3)
    const fdc3Frame = mainWebContents?.mainFrame.frames.find((f) =>
      f.url.includes(`/apps/${SP_FDC3_APP_ID}`),
    );

    if (!fdc3Frame) {
      logger.warn(FDC3_APP_NOT_INSTALLED_LOG);
      return FDC3_APP_NOT_INSTALLED_MSG;
    }

    const command = `window.fdc3['${method}']?.(${args
      ?.map((a) => JSON.stringify(a))
      .join(',')})`;

    return new Promise((resolve) => {
      // automatically resolve after 30s (in case the action does not respond)
      const t = setTimeout(() => {
        logger.info(FDC3_ACTION_TIMEOUT_LOG);
        resolve(FDC3_ACTION_TIMEOUT_MSG);
      }, FDC3_ACTION_TIMEOUT_MS);

      fdc3Frame
        .executeJavaScript(command)
        .then((res) => resolve(FDC3_ACTION_SUCCESS_MSG + JSON.stringify(res)))
        .catch((err) => {
          logger.error(FDC3_ACTION_ERROR_LOG, err.message);
          resolve(FDC3_ACTION_ERROR_MSG + err.message);
        })
        .finally(() => clearTimeout(t));
    });
  }
}

export const fdc3Handler = new FDC3Handler();
