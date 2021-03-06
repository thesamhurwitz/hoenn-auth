module.exports = {
  extends: ['airbnb-typescript/base'],
  plugins: ['import', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  rules: {
    "@typescript-eslint/comma-dangle": ["error", "never"],
    "@typescript-eslint/no-redeclare": "off",
    "@typescript-eslint/no-unused-vars": "off",
  }
}
