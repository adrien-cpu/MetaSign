// .eslintrc.js
module.exports = {
    extends: [
        "next/core-web-vitals",
        // ...vos autres extensions
    ],
    rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["warn", {
            "argsIgnorePattern": "^_",
            "varsIgnorePattern": "^_",
            "caughtErrorsIgnorePattern": "^_",
            "destructuredArrayIgnorePattern": "^_"
        }],
        '@next/next/no-img-element': 'off',
        // ...autres règles
    }
};