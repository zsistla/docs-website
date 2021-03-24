const fetch = require('node-fetch');
const jsdom = require('jsdom');

const toVFile = require('./to-vfile');
const { write } = require('to-vfile');
const convertFile = require('./convert-file');
const runCodemod = require('../codemod/run');
const codemods = require('../../../codemods');

const { JSDOM } = jsdom;

const JP_DIR = 'src/i18n/content/jp';

const doc = {
  docUrl:
    'https://jajp-newrelic-docs.onelink-translations.com/docs/agents/c-sdk',
};

const vfileOptions = {
  baseDir: JP_DIR,
};

const fetchContent = async (url) => {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
    },
  });
  return res.text();
};

const run = async () => {
  const html = await fetchContent(doc.docUrl);

  const { document } = new JSDOM(html).window;

  const titleNode = document.querySelector('h1');

  doc.title = titleNode.textContent;

  doc.body = document.querySelector('[data-swiftype-name=body]').outerHTML;

  const file = toVFile(doc, vfileOptions);
  convertFile(file);

  try {
    await runCodemod(file, { codemods });
    console.log(file);
  } catch (e) {
    // do nothing
  }
  write(file, 'utf-8');
};

run();
