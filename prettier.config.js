// @ts-check

/**
 * @type {import('prettier').Config}
 */
export default {
  useTabs: true,
  singleQuote: true,
  quoteProps: "consistent",
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrderSortSpecifiers: true,
};
