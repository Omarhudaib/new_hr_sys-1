/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';

// تُحقن قائمة الملفات هنا أثناء عملية البناء
precacheAndRoute(self.__WB_MANIFEST);
