/**
 * Graaff <https://github.com/andismith/graaff>
 *
 * Copyright 2015, Andi Smith, contributors.
 * Licensed under the MIT License (MIT).
 */

module.exports.register = function (Handlebars) {
  'use strict';

  Handlebars.registerHelper('replaceStr', function (haystack, needle, replacement) {
    console.log('replaceStr ' + haystack, needle, haystack.replace(needle, replacement));
    if (haystack && needle) {
      return haystack.replace(needle, replacement);
    } else {
      return '';
    }
  });


};