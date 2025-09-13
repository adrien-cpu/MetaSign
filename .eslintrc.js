// .eslintrc.js
module.exports = {
    extends: [
        "next/core-web-vitals"
    ],
    rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
        '@next/next/no-img-element': 'warn',
        'react/no-unescaped-entities': 'warn',
        'jsx-a11y/alt-text': 'warn',
        'prefer-const': 'off',
        '@typescript-eslint/no-namespace': 'off'
    }
};