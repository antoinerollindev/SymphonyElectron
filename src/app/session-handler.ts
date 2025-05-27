import { app, CookiesSetDetails, session } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { isDevEnv } from '../common/env';
import { logger } from '../common/logger';
import { getCommandLineArgs } from '../common/utils';
import { whitelistHandler } from '../common/whitelist-handler';
import { config, IConfig } from './config-handler';

const sessionPath = path.join(
  app.getPath('userData'),
  'temp-dev.Symphony.session',
);

export const setSessionCookie = async (
  url: string,
  skeyValue: string,
  anticsrfValue: string,
) => {
  const { subdomain, tld, domain } = whitelistHandler.parseDomain(url);
  const navigateURL = `https://${subdomain}.${domain}${tld}`;
  const cookieDomain = `.${subdomain}.${domain}${tld}`;
  if (skeyValue && anticsrfValue) {
    const skeyCookie: CookiesSetDetails = {
      url: navigateURL,
      name: 'skey',
      value: skeyValue,
      secure: true,
      httpOnly: true,
      sameSite: 'no_restriction',
      domain: cookieDomain,
      path: '/',
    };
    const csrfCookie: CookiesSetDetails = {
      url: navigateURL,
      name: 'anti-csrf-cookie',
      value: anticsrfValue,
      secure: true,
      sameSite: 'no_restriction',
      domain: cookieDomain,
      path: '/',
    };
    try {
      await session.defaultSession.cookies.set(skeyCookie);
      await session.defaultSession.cookies.set(csrfCookie);
      logger.info('session-handler: cookies has been set');
    } catch (error) {
      logger.error(
        'session-handler: error occurred with cookies. Details: ',
        error,
      );
    }
  }
};

export const saveSessionCookie = async () => {
  if (isDevEnv) {
    const skeyCookie = await session.defaultSession.cookies.get({
      name: 'skey',
    });
    const skey = skeyCookie[0].value;
    const antiCsrfCookie = await session.defaultSession.cookies.get({
      name: 'anti-csrf-cookie',
    });
    const antiCsrfToken = antiCsrfCookie[0].value;

    const sessionInfo = JSON.stringify({ skey, antiCsrfToken }, null, 2);
    fs.writeFileSync(sessionPath, sessionInfo);
  }
};

export const reviveSessionCookie = () => {
  if (isDevEnv) {
    if (fs.existsSync(sessionPath)) {
      logger.info(`session info found at ${sessionPath}`);
      const val = fs.readFileSync(sessionPath, 'utf8');
      try {
        const { skey, antiCsrfToken } = JSON.parse(val);
        if (skey && antiCsrfToken) {
          const urlArg = getCommandLineArgs(process.argv, '--url', false);
          const url = urlArg
            ? urlArg.split('=')[1]
            : (config.userConfig as IConfig).url;

          setSessionCookie(url, skey, antiCsrfToken);
        }
      } catch (error) {
        logger.error('Failed to parse session info', error);
      }
    } else {
      logger.info(`no session info found at ${sessionPath}`);
    }
  }
};
