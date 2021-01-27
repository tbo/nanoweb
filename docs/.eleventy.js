const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const markdownIt = require('markdown-it');
const pluginTOC = require('eleventy-plugin-nesting-toc');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItAttrs = require('markdown-it-attrs');
const loadLanguages = require('prismjs/components/');
// This Prism langauge supports HTML and CSS in tagged template literals
loadLanguages(['js-templates']);

module.exports = function (eleventyConfig) {
  const addCollection = name => {
    eleventyConfig.addCollection(name, function (collection) {
      // Order the 'guide' collection by filename, which includes a number prefix.
      // We could also order by a frontmatter property
      return collection.getFilteredByGlob(`./docs/${name}/*`).sort(function (a, b) {
        if (['template', 'links'].includes(a.fileSlug)) {
          return -1;
        }
        if (a.fileSlug < b.fileSlug) {
          return -1;
        }
        if (b.fileSlug < a.fileSlug) {
          return 1;
        }
        return 0;
      });
    });
  };
  eleventyConfig.addPassthroughCopy('./docs/css/');
  eleventyConfig.addPassthroughCopy('./docs/CNAME');
  eleventyConfig.addPassthroughCopy('./docs/images/');
  eleventyConfig.addPassthroughCopy('./docs/api/');
  eleventyConfig.addPassthroughCopy('./packages/links/dist/');
  eleventyConfig.addPlugin(pluginTOC, { tags: ['h2', 'h3'] });
  eleventyConfig.addPlugin(syntaxHighlight);
  addCollection('template');
  addCollection('links');
  const md = markdownIt({ html: true, breaks: true, linkify: true }).use(markdownItAttrs).use(markdownItAnchor);
  eleventyConfig.setLibrary('md', md);

  return {
    dir: { input: './docs', output: 'site' },
  };
};
