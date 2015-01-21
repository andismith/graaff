/**
 * Graaff <https://github.com/andismith/graaff>
 *
 * Copyright 2015, Andi Smith, contributors.
 * Licensed under the MIT License (MIT).
 */

module.exports.register = function (Handlebars) {
  'use strict';

  /* Chain handlebars helpers together. Helpers are listed in the function arguments.
   *
   * @return           string    The value after all helpers are applied.
   */
  Handlebars.registerHelper('chain', function () {
    var helpers = [];
    var i = 0;
    var j = 0;
    var value = '';

    for (; i < arguments.length; i++) {
      value = arguments[i];

      if (Handlebars.helpers[value]) {
        helpers.push(Handlebars.helpers[value]);
      } else {
        // we no longer have a recognised helper
        for (j = 0; j < helpers.length; j++) {
          value = helpers[j](value, arguments[i + 1]);
        }
        return value;
      }
    }
  });
};