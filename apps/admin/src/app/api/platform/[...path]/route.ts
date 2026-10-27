import {createPlatformProxy} from '@cex/bff';

const proxy=createPlatformProxy({accessCookie:'cex_admin_access',refreshCookie:'cex_admin_refresh',csrfCookie:'cex_admin_csrf',publicOriginEnvironment:'ADMIN_PUBLIC_ORIGIN'});
export const GET=proxy;export const POST=proxy;export const PUT=proxy;export const PATCH=proxy;export const DELETE=proxy;
