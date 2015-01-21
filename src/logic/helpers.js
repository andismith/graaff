/**
 * Graaff <https://github.com/andismith/graaff>
 *
 * Copyright 2015, Andi Smith, contributors.
 * Licensed under the MIT License (MIT).
 */

module.exports.register = function (Handlebars, options, params) {
  'use strict';

  // list of the Graaff helpers
  var HELPERS = [
    'utils',
    'extend',
    'strings',
    'conditionals',
    'posts'
  ];

  var helper = {};
  var i = 0;
  var l = HELPERS.length;

  while (i < l) {
    helper = require('./helpers/' + HELPERS[i]);
    
    if (!(typeof helper === 'undefined' || typeof helper.register === 'undefined')) {
      helper.register(Handlebars, options, params);
    }
    i++;
  }
};