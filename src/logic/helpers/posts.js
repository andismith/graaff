/**
 * Graaff <https://github.com/andismith/graaff>
 *
 * Copyright 2015, Andi Smith, contributors.
 * Licensed under the MIT License (MIT).
 */

module.exports.register = function (Handlebars) {
  'use strict';

  /* Get the URL for the target page relative to our current page.
   *
   * @param targetPage  string  The page we want the URL of
   * @return            string  The path to the page we wanted
   */
  function getUrl (targetPage) {
    var buildPath = Handlebars.helpers.getBuildPath();
    var currentPage = Handlebars.helpers.getPagePath();
    var path = require('path');

    // dirname doesn't have a trailing slash, so add one
    currentPage = (currentPage + '/').replace('//', '');
    targetPage = (targetPage + '/').replace('//', '');

    if (buildPath && typeof buildPath === 'string') {
      currentPage = currentPage.replace(buildPath, '');
      targetPage = targetPage.replace(buildPath, '');
    }

    console.log(currentPage, targetPage, path.relative(currentPage, targetPage));

    return path.relative(currentPage, targetPage);
  };

  /* Check whether a post is matches a specified filter.
   * Filters can be inclusive, or exclusive (prefixed with a !)
   *
   * @param page       object    The page
   * @param filter     object    The filter object
   * @return           object    Whether the post is included
   */
  function isPageInFilter(post, filter) {
    var allowed = true;
    var prop = {};
    var values = [];

    for (prop in filter) {
      if (allowed && filter.hasOwnProperty(prop)) {
        // included items
        if (prop.indexOf('!') === -1) {
          values = [].concat(post.data[prop]);
          if (values.indexOf(filter[prop]) === -1) {
            // value not found
            allowed = false;
          }
        // excluded items
        } else {
          values = [].concat(post.data[prop.substr(1)]);
          if (values.indexOf(filter[prop]) > -1) {
            // value found
            allowed = false;
          }
        }

      }
    }

    return allowed;
  }

  /* Find out if a value is in range
   *
   * @param  value    number    The number to test
   * @param  start    number    The start of the range
   * @param  end      number    The end of the range
   * @return          boolean   Whether the number was in range
   */
  function isInRange(value, start, end) {
    return (value >= start && value < end);
  }

  /* Get the filters passed in, which may or may not be dynamically
   * generated.
   *
   * @param  thisPage object  The page for any dynamic lookup
   * @param  options  object  The options object with the filters
   * @return          object  A list of filters
   */
  function getFilters(thisPage, options) {
    var filters = {};
    var prop = {};

    if (options && options.hash && options.hash.filter) {
      filters = JSON.parse(options.hash.filter) || {};

      for (prop in filters) {
        if (filters.hasOwnProperty(prop)) {
          filters[prop] = Handlebars.helpers.getData(thisPage, filters[prop]);

          // if the result is empty, remove it as it hasn't been configured
          if (filters[prop] === '') {
            delete filters[prop];
          }
        }
      }
    }

    return filters;
  }

  /* Get the sorting options
   *
   * @param thisPage   object    The page for any dynamic lookup
   * @param options    object    The Handlebar helper options
   * @return           object    Sort object
   */
  function getSortOptions(thisPage, options) {
    var sort = {};
    if (options && options.hash && options.hash.sort) {
      sort = JSON.parse(options.hash.sort) || {};

      sort.field = Handlebars.helpers.getData(thisPage, sort.field);
      sort.order = Handlebars.helpers.getData(thisPage, sort.order);
      sort.ascOrder = (sort.order === 'asc');

      // if the sort field is empty, remove it as it hasn't been configured
      if (sort.field === '') {
        sort = {};
      }
    }

    return sort;
  }

  /* Retrieve a collection of only the filtered pages, useful for
   * working out the position of a page in relation to other pages
   *
   * @param collection object    The original collection
   * @param filter     object    The static filter
   * @return           object    The filtered collection
   */
  function getFilteredPages(collection, filter) {
    var i = 0;
    var l = 0;
    var page = {};
    var result = [];

    l = collection.length;

    // make a list of the filtered posts
    for (i = 0; i < l; i++) {
      page = collection[i] || {};
      if (page.data && isPageInFilter(page, filter)) {
        result.push(page);
      }
    }

    return result;
  }

  /* Sort pages based on a property.
   *
   * @param property   string    The property to sort on
   * @param ascOrder   boolean   Order in ascending order
   */
  function sortPages(property, ascOrder) {
    var propertyA = {};
    var propertyB = {};
    var sortOrder = (ascOrder) ? 1 : -1;

    property = property.split('.');

    // return a compare function.
    return function (a, b) {
      if (a.data && b.data) {
        propertyA = a.data;
        propertyB = b.data;

        /* As our property could be dot notation, like nav.order
           we need to loop through it and find the value */
        for (var i = 0; i < property.length; i++) {
          if (typeof propertyA !== 'undefined') {
            propertyA = propertyA[property[i]];
          }
          if (typeof propertyB !== 'undefined') {
            propertyB = propertyB[property[i]];
          }
        }

        if (propertyA < propertyB) {
          return -1 * sortOrder;
        }
        if (propertyA > propertyB) {
          return 1 * sortOrder;
        }
      }
      return 0;
    };
  }

  function getFirstCharacters(thisPage, numChars) {
    var content = thisPage.page;

    content = content.replace('\n', '').replace('  ', ' ');

    return content.substr(0, numChars);
  }

  function getExcerpt(thisPage, siteData) {
    var excerpt = '';
    if (thisPage.page &&
      thisPage.page.indexOf('<!--more-->') > -1 &&
      getUrl(thisPage.dirname) !== '') {

      excerpt = thisPage.page.split('<!--more-->').shift();
      if (siteData) {
        excerpt += '\n[' + siteData.settings.moreLink + '](' + getUrl(thisPage.dirname) + ')';
      }
      return excerpt;
    } else {
      return thisPage.page;
    }
  }

  /* Retreive the pages from the collection that are within the range and
   * include useful meta data at population, such as access to the data
   * object, the URL and where it sits within the filtered collection.
   *
   * @param collection object    The filtered pages collection
   * @param rangeStart number    The start of the range we want to get
   * @param rangeEnd   number    The end of the range we want to get
   * @param siteData   object    An additional data object we wish to have access to
   *                             from our pages.
   * @param options    object    The Handlebar helper options
   * @return           object    The page collection in range.
   */
  function getPagesInRange(collection, rangeStart, rangeEnd, options) {
    var count = 0;
    var i = 0;
    var l = 0;
    var page = {};
    var result = '';
    var siteData = Handlebars.helpers.getSiteData();

    l = collection.length;

    // go through the list of filtered pages to see what fits on this page
    for (; i < l; i++) {
      page = collection[i] || {};

      if (isInRange(count, rangeStart, rangeEnd)) {

        // page counters
        page.index = count;
        page.total = l;
        page.firstInSet = (count === 0);
        page.firstOnPage = (count === rangeStart);
        page.lastInSet = (count === (l - 1));
        page.lastOnPage = (count === (l - 1) || count === (rangeEnd - 1));

        // all data
        page.siteData = siteData;

        // useful page information
        page.title = page.data.title || siteData.title;
        page.summary = page.data.summary || getFirstCharacters(page) || siteData.description;
        page.author = page.data.author || siteData.author || '';
        page.authorLink = page.data.authorLink || siteData.author.url || '';
        page.pageContent = getExcerpt(page, siteData);
        page.url = getUrl(page.dirname);
        page.fullUrl = siteData.url + '/' + getUrl(page.dirname);
        page.pathUrl = page.dirname;
        page.currentPage = Handlebars.helpers.getPagePath(); // horrible, but can't see another way

        result += options.fn(page);
      }
      count++;
    }

    // debug
    if (count === 0) {
      console.log('No posts on page', rangeStart, rangeEnd);
    }

    return result;
  }

  /* Get all the pages, as there can be multiple matches with pages
   *
   * @param collection object    The Assemble collection
   * @return           array     The who collection as one array
   */
  function collatePages(collection) {
    var i = 0;
    var j = 0;
    var collectionLength = 0;
    var pageLength = 0;
    var result = [];

    for (i = 0, collectionLength = collection.length; i < collectionLength; i++) {
      for (j = 0, pageLength = collection[i].pages.length; j < pageLength; j++) {
        result.push(collection[i].pages[j]);
      }
    }

    return result;
  }

  function replaceAllValues(thisPost, string, escape) {
    var dataKey = '';
    var dataValue = '';
    var startPosition = 0;
    var endPosition = 0;

    startPosition = string.indexOf('{');
    endPosition = string.indexOf('}') + 1;

    if (startPosition > -1 && endPosition > -1) {
      dataKey = string.substring(startPosition, endPosition);
      dataValue = Handlebars.helpers.getData(thisPost, dataKey);

      if (dataKey === '{url}') {
        dataValue = thisPost.siteData.url + '/' + dataValue;
      }

      if (escape) {
        dataValue = encodeURI(dataValue);
      }
      string = string.replace(dataKey, dataValue);
      return replaceAllValues(thisPost, string, escape);
    }
    return string;
  }

  /* Get a data value based on the property specified
   *
   * @param  thisPage  object    The post (with all YAML options)
   * @param  value     string    The value to lookup - e.g. "{list.sort}" or "title"
   * @return           string    The value found - or the original string
   */
  Handlebars.registerHelper('getData', function(thisPage, value) {
    var i = 0;
    var indexOpen = 0;
    var indexClose = 0;
    var l = 0;
    var lookup = '';

    if (typeof value === 'string') {
      indexOpen = value.indexOf('{');
      indexClose = value.indexOf('}');

      // if there is a dynamic value
      if (indexOpen > -1 && indexClose > -1) {
        // get the string to lookup and split by dot notation
        lookup = value.substring(indexOpen + 1, indexClose).split('.') || '';

        // get a complete object of thisPage to traverse through
        value = thisPage;

        // loop through an objects property hierarchy
        for (i = 0, l = lookup.length; i < l; i++) {
          // set value to current item
          value = value[lookup[i]] || '';
        }
      }
    }

    return value;
  });

  /* Get a list of posts based on the filter specified.
   *
   * @param collection object    The Assemble collection
   * @param options    object    The handlebar helper options
   * @return           object    The filtered list of pages
   */
  Handlebars.registerHelper('getPosts', function (collection, options) {
    var properties = {};
    var pages = {};
    var sort = {};
    var rangeEnd = 0;
    var rangeStart = 0;
    var thisPage = this;

    options = options || {};

    // Assemble puts collection inside an array
    if (collection && collection.length >= 1) {
      pages = collatePages(collection);

      if (options && options.hash) {
        // get page details
        if (options.hash.page) {
          properties = JSON.parse(options.hash.page) || {};
        }
      }

      properties.start = Handlebars.helpers.getData(thisPage, properties.start) || 0;
      properties.length = Handlebars.helpers.getData(thisPage, properties.length) || thisPage.siteData.settings.pagination.length;

      // sort our posts
      sort = getSortOptions(thisPage, options);

      if (Object.keys(sort).length > 0 && sort.field) {
        pages.sort(sortPages(sort.field, sort.ascOrder));
      }

      pages = getFilteredPages(pages, getFilters(thisPage, options));

      // calculate start and end posts.
      rangeStart = properties.start * properties.length;
      rangeEnd = rangeStart + properties.length;

      return getPagesInRange(pages, rangeStart, rangeEnd, options);

    } else {
      // debug
      console.log('Collection object empty');
    }

    return '';
  });

  /*
  
   */
  Handlebars.registerHelper('getUrl', function (targetPage) {
    return getUrl(targetPage);
  });

  /*
    Friendly version of getUrl for resources.
   */
  Handlebars.registerHelper('getResource', function (resource) {
    return getUrl(resource);
  });


  Handlebars.registerHelper('replaceValues', function (thisPost, string, escape) {
    return replaceAllValues(thisPost, string, escape);
  });
};