module.exports = {
    parser: 'babel-eslint',
    plugins: [
        "jest",
    ],
    env: {
        node: true,
        "jest/globals": true,
        "es6": true
    },
    extends: [
        "eslint:recommended",
        "google",
    ],
    parserOptions: {
        ecmaVersion: 8,
        sourceType: "module",
        ecmaFeatures: {
            spread: true,
            experimentalObjectRestSpread: true,
        }
    },
    rules: {
        indent: ['error', 4, {
            SwitchCase: 1,
            FunctionExpression: {
                parameters: "first",
            },
        }],
        "padded-blocks": 0,
        "no-constant-condition": 0,
    }
};
