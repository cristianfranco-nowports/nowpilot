module.exports = {
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'pt'],
    localeDetection: false
  },
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
} 