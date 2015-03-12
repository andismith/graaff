/**
 * Graaff <https://github.com/andismith/graaff>
 *
 * Instant search functionality
 *
 * Copyright 2015, Andi Smith, contributors.
 * Licensed under the MIT License (MIT).
 */

(function () {

  // constants
  var CSS_CLASS = {
    input: 'search__input',
    inputError: 'search__input--no-result',
    path: 'search__path',
    result: 'search__result',
    resultSelected: 'search__result--selected',
    resultList: 'search__results',
    showResultList: 'search__results--visible',
  };

  var ERROR_MSG = 'Sorry, search is currently unavailable';
  var JSON_FILE = '/search.json';
  var MIN_CHARS = 2;
  var MAX_RESULTS = 10;

  // variables
  var currentResults = [];
  var isFocused = false;
  var pagePath = '';
  var searchData;
  var selectedResult = 0;
  var $searchInput = {};
  var $searchResults = {};

  /*
    Check if we have any data to look through yet
   */
  function hasSearchData() {
    if (typeof searchData !== 'undefined') {
      return true;
    } else {
      // we need to load our data
      loadSearchData();
      return false;
    }
  }

  /*
    Make a request to load our search data from the server
   */
  function loadSearchData() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200) {
          searchData = JSON.parse(xmlhttp.responseText);
          searchData = searchData.posts;
          if (isFocused) {
            getResults($searchInput.value);
          }
        } else {
          // remove our box
          $searchInput.remove();
          alert(ERROR_MSG);
        }
      }
    };

    xmlhttp.open("GET", pagePath + JSON_FILE, true);
    xmlhttp.send();
  }

  /*
    Check for whether this property contains a match for our
    current search.
   */
  function checkForMatch(page, prop, currentSearch) {
    var value = page[prop].toLowerCase();

    currentSearch = currentSearch.toLowerCase();

    if (prop !== 'url') {
      if (value.indexOf(currentSearch) > -1) {
        return {
          title: page.title,
          url: page.url,
          match: {
            prop: prop,
            value: highlightMatch(page, prop, value, currentSearch)
          }
        };
      }
    }
  }

  /*
    Insert a value in to a string at a certain index position
   */
  function insert(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
  }

  /*
    Wrap our match in <em> tags to add emphasis
   */
  function highlightMatch(page, prop, matchedValue, currentSearch) {
    var start = matchedValue.indexOf(currentSearch.toLowerCase());
    var end = start + currentSearch.length;

    return insert(insert(page[prop], end, '</em>'), start, '<em>');
  }

  /*
    Get the results for our current search
   */
  function getResults(currentSearch) {
    var i = 0;
    var l = 0;
    var page = {};
    var prop = '';
    var result = {};
    var results = [];

    // check we have a valid search and data to search through
    if (currentSearch && currentSearch.length >= MIN_CHARS && hasSearchData()) {
      l = searchData.length;

      for (; (i < l && results.length < MAX_RESULTS); i++) {
        page = searchData[i];
        for (prop in page) {
          if (page.hasOwnProperty(prop)) {
            result = checkForMatch(page, prop, currentSearch);
            if (result) {
              results.push(result);
              break;
            }
          }
        }
      }

      currentResults = results;
      displayResults(results);
    } else {
      removeResults();
    }
  }

  /*
    Remove our results from our list
   */
  function removeResults() {
    while ($searchResults.firstChild) {
      $searchResults.removeChild($searchResults.firstChild);
    }

    selectedResult = 0;
    $searchResults.classList.remove(CSS_CLASS.showResultList);
    $searchInput.classList.remove(CSS_CLASS.inputError);
  }

  /*
    Simple formatting to make values have a single capital letter
   */
  function toTitleCase(value) {
    return value.charAt(0).toUpperCase() + value.substr(1).toLowerCase();
  }

  /*
    Generate the result markup
   */
  function generateResult(result) {
    var $result = document.createElement('li');
    var $anchor = document.createElement('a');

    if (result.match.prop === 'title') {
      $anchor.innerHTML = result.match.value;
    } else {
      $anchor.innerHTML = [result.title,
        '<span class="milli">',
        toTitleCase(result.match.prop),
        ':',
        result.match.value,
        '</span>'].join(' ');
    }

    $anchor.href = pagePath + result.url;
    $anchor.classList.add(CSS_CLASS.result);

    $result.appendChild($anchor);

    return $result;
  }

  /*
    Display our results in the DOM
   */
  function displayResults(results) {
    var $resultFragment = document.createDocumentFragment();

    removeResults();

    if (results.length) {

      results.forEach(function (result) {
        $resultFragment.appendChild(generateResult(result));
      });

      $searchResults.appendChild($resultFragment);

      $searchResults.classList.add(CSS_CLASS.showResultList);
      addSelectedClass(0);

    } else {
      $searchInput.classList.add(CSS_CLASS.inputError);
    }
  }

  /*
    We need to fire a result, trigger it here
   */
  function triggerResult(index) {
    var url = '';

    if ($searchResults.children.length > index) {
      url = $searchResults.querySelectorAll('.' + CSS_CLASS.result)[index].getAttribute('href');
      window.location = url;
    } else {
      $searchInput.classList.add(CSS_CLASS.inputError);
      setTimeout(function() {
        $searchInput.value = '';
        $searchInput.classList.remove(CSS_CLASS.inputError);
      }, 500);
    }
  }

  /*
    Remove our selected class from the results list
   */
  function removeSelectedClass() {
    if ($searchResults) {
      $elem = $searchResults.getElementsByClassName(CSS_CLASS.resultSelected)[0];
      if ($elem) {
        $elem.classList.remove(CSS_CLASS.resultSelected);
      }
    }
  }

  /*
    Add our selected class to our new result list item
   */
  function addSelectedClass(selectedResult) {
    if ($searchResults) {
      // add new selected class
      $elem = $searchResults.querySelectorAll('.' + CSS_CLASS.result)[selectedResult];

      if ($elem) {
        $elem.classList.add(CSS_CLASS.resultSelected);
      }
    }
  }

  /*
    Handle those lovely user actions
   */
  function handleEvents() {
    $searchInput.addEventListener('keyup', function (e) {
      switch (e.keyCode) {
        case 13: // enter
          triggerResult(selectedResult);
          break;
        case 40: // down
          if (selectedResult < currentResults.length - 1) {
            removeSelectedClass();
            selectedResult++;
            addSelectedClass(selectedResult);
          }
          break;
        case 38: // up
          if (selectedResult > 0) {
            removeSelectedClass();
            selectedResult--;
            addSelectedClass(selectedResult);
          }
          break;
        default: // everything else
          getResults($searchInput.value);
          break;
      }
    });

    // stop default behaviour of up and down
    $searchInput.addEventListener('keydown', function (e) {
      if (e.keyCode === 38 || e.keyCode === 40) {
        e.preventDefault();
      }
    });

    $searchInput.addEventListener('focus', function () {
      isFocused = true;
      if (currentResults.length > 0) {
        $searchResults.classList.add(CSS_CLASS.showResultList);
      }
    });

    $searchInput.addEventListener('blur', function () {
      isFocused = false;
      // add a timeout to allow for mouse clicks!
      setTimeout(function() {
        $searchResults.classList.remove(CSS_CLASS.showResultList);
      }, 500);
    });
  }

  /*
    Keep a reference to these guys, it'll come in handy
   */
  function cacheElements() {
    $searchInput = document.querySelector('.' + CSS_CLASS.input);
    $searchResults = document.querySelector('.' + CSS_CLASS.resultList);
  }

  /*
    We need the page path so we can keep our script relative
    to the current page.
   */
  function getPagePath() {
    var $searchPath = document.getElementById(CSS_CLASS.path);
    pagePath = $searchPath.value;
  }

  /*
    Kick this bad boy off
   */
  function init() {
    cacheElements();
    handleEvents();
    getPagePath();
  }

  init();

}());
