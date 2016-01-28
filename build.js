
'use strict';

const path = require('path');

const Metalsmith = require('metalsmith');
const collections = require('metalsmith-collections');
const markdown = require('metalsmith-markdown');
const permalinks = require('metalsmith-permalinks');
const layouts = require('metalsmith-layouts');
const evaluate = require('metalsmith-in-place');


// register handlebars helpers
// these are only needed to enhance the demo.
require('./handlebars-helper');

function skip(options){
  return function(files, metalsmith, done){
    for (let k in files){
      if (files.hasOwnProperty(k) && options.pattern.test(k)){
        delete files[k];
      }
    }
    done();
  };
};

const paginate = require('./index');


const ms = new Metalsmith(process.cwd());


ms
  .source('./sample/src')
  .use(skip({ pattern: /^__/ }))
  .use(collections({
    posts: {
      pattern: 'posts/*.md',
      sortBy: 'date',
      reverse: true
    }
  }))


  .use(paginate({

    collection: 'posts',

    // the maximum number of element that could be displayed
    // in the same page.
    elementsPerPage: 5,

    // the pattern ...
    pagePattern: 'page/:PAGE/index.html',

    // the path where the pagination template is located.
    // it should be relative to the path configured as "source" for metalsmith.
    paginationTemplatePath: '__partials/pagination.html',

    // the name of the layout that should be used to create the page.
    layoutName: 'archive.html'

  }))


  .use(markdown())
  .use(permalinks(':title'))
  .use(evaluate({
    engine: 'handlebars',
    partials: './sample/src/__partials',
    cache: false
  }))
  .use(layouts({
    engine: 'handlebars',
    directory: './sample/src/__layouts'
  }))
  .destination('./sample/dist')
  .build(function(err) {
    if (err) {
      throw err;
    }
    console.log('DONE!');
  });
