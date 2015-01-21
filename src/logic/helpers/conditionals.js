/**
 * Graaff <https://github.com/andismith/graaff>
 *
 * Copyright 2015, Andi Smith, contributors.
 * Licensed under the MIT License (MIT).
 */

module.exports.register = function (Handlebars) {
  'use strict';

  /**
   * The {{#exists}} helper checks if a variable is defined.
   */
  Handlebars.registerHelper('exists', function (options) {
    var found = false;
    var i = 0;
    var l = 0;
    var obj = {};

    options = options || {};

    if (options && options.hash && options.hash.values) {
      
      // try to parse it
      try {
        obj = JSON.parse(options.hash.values);

        if (Array.isArray(obj)) {
          for (l = obj.length; i < l; i++) {
            if (Handlebars.helpers.getData(this, obj[i]) !== '') {
              found = true;
              break;
            }
          }
        }
      } catch (e) {
        if (Handlebars.helpers.getData(this, options.hash.values) !== '') {
          found = true;
        }
      }
    }

    if (found) {
      return options.fn(this);
    } else {
      if (typeof options.inverse === 'function') {
        return options.inverse(this);
      }
    }
  });

};