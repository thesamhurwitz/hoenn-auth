module.exports = {
  extends: ['airbnb-typescript/base'],
  plugins: ['import', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  rules: {
    "@typescript-eslint/no-redeclare": "off"
  }
}
