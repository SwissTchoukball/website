<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const { t } = useI18n();

// TODO: Consider using useSeoMeta
// useSeoMeta(() => {
//   return {
//     titleTemplate: (titleChunk) => {
//       // If undefined or blank then we don't need the hyphen
//       return titleChunk ? `${titleChunk} - ${t('title')}` : t('title').toString();
//     },
//   };
// });

useHead(() => {
  return {
    titleTemplate: (titleChunk) => {
      // If undefined or blank then we don't need the hyphen
      return titleChunk ? `${titleChunk} - ${t('title')}` : t('title').toString();
    },
    meta: [
      { name: 'format-detection', content: 'telephone=no' },
      {
        name: 'description',
        content: t('defaultDescription'),
      },
      {
        name: 'keywords',
        content:
          'tchoukball, tchouk, tchouk-ball, sport, sport pour tous, fair-play, accessible, intense, tactique, prix thulin, Swiss Tchoukball, fédération, verband, federazione, federation, switzerland, suisse, schweiz, svizerra',
      },
      { property: 'og:site_name', content: t('title') },
      {
        property: 'og:description',
        content: (route.meta.description as string) || t('defaultDescription'),
      },
      {
        property: 'og:type',
        content: `website`,
      },
      {
        property: 'og:url',
        content: `${runtimeConfig.public.websiteBaseUrl}${route.path}`,
      },
      {
        property: 'og:image',
        content: `${runtimeConfig.public.websiteBaseUrl}/images/og-swiss-tchoukball.jpg`,
      },
      {
        property: 'og:image:alt',
        content: 'Logo of Swiss Tchoukball over a background featuring the net of a tchoukball frame.',
      },
      {
        name: 'twitter:card',
        content: 'summary',
      },
      {
        name: 'twitter:site',
        content: '@SwissTchoukball',
      },
    ],
    link: [
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#ff0000' },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        hreflang: 'fr',
        href: 'https://feeds.tchoukball.ch/news-fr.xml',
        title: 'News Swiss Tchoukball en français',
      },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        hreflang: 'de',
        href: 'https://feeds.tchoukball.ch/news-de.xml',
        title: 'Swiss Tchoukball News auf Deutsch',
      },
    ],
  };
});
</script>
