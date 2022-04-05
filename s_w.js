importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');

if (workbox) {
  console.log('Workbox is loaded');
} else {
  console.log('Workbox can not be loaded');
}

workbox.precaching.precacheAndRoute([]);