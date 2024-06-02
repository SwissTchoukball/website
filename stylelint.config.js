/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  rules: {
    'rule-empty-line-before': [
      'always',
      { except: ['first-nested', 'after-single-line-comment'], ignore: ['after-comment'] },
    ],
    'selector-class-pattern': null,
    'value-keyword-case': 'lower',
  },
};
