import {createPlatformProxy} from '@cex/bff';

const proxy=createPlatformProxy({accessCookie:'cex_access',refreshCookie:'cex_refresh',csrfCookie:'cex_csrf',publicOriginEnvironment:'EXCHANGE_PUBLIC_ORIGIN'});
export const GET=proxy;export const POST=proxy;export const PUT=proxy;export const PATCH=proxy;export const DELETE=proxy;
