const config: import('eslint').Linter.Config = {
  rules: {
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks:
          '(useDoubleClick|useDoubleTap|useHideableState|useAsync|useObjectURL|useUpdateEffect|useUpdatedValue|useMemoDisposer)',
      },
    ],
  },
};

module.exports = config;
