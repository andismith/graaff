/**
 * Graaff <https://github.com/andismith/graaff>
 *
 * Copyright 2015, Andi Smith, contributors.
 * Licensed under the MIT License (MIT).
 */

module.exports.register = function (Handlebars) {
  'use strict';

  var _buildPath = '';
  var _pagePath = '';
  var _siteData = {};

  /* 
   * Get the build path
   *
   * @return    string  The site build path (normally dist) that is set
   */
  Handlebars.registerHelper('getBuildPath', function () {
    return _buildPath;
  });

  /* 
   * Set the build path
   *
   * @param path  string  The site build path (normally dist) to set
   */
  Handlebars.registerHelper('setBuildPath', function (path) {
    _buildPath = path;
  });

  /* 
   * Get the current page path
   *
   * @return    string  The path to the current page
   */
  Handlebars.registerHelper('getPagePath', function () {
    return _pagePath;
  });

  /* 
   * Set the current page path
   *
   * @param path  string  The path to the current page
   */
  Handlebars.registerHelper('setPagePath', function (path) {
    _pagePath = path;
  });

  /* 
   * Set the site data
   *
   * @return    string  The site data to set
   */
  Handlebars.registerHelper('setSiteData', function (data) {
    _siteData = data;
  });

  /* 
   * Get the build path
   *
   * @return    string  The site build path (normally dist) that is set
   */
  Handlebars.registerHelper('getSiteData', function () {
    return _siteData;
  });

};