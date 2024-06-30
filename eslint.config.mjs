// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'vue/html-self-closing': ['error', { html: { void: 'always', normal: 'any' }, svg: 'any' }],
  },
});
