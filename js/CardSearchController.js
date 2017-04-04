'use strict';
var cardSearchApp = angular.module('cardSearchApp');
cardSearchApp.controller('CardSearchController', ['$scope', '$http', '$window', 'CDFService', 'SWIPService',  function($scope, $http, $window, CDFService, SWIPService) {

  $scope.data = {
    matches: [],
    cardList: [],
    loadingLight: true,
    loadingDark: true,
    performedSearch: false,
    noResultsFound: false,
    selectedCard: null,
    showAdvancedSearch: false,
    imageLoadFailure: false,
    textOnly: false,
    showExtraData: false
  };

  $scope.selectCard = function(card) {
    $scope.data.selectedCard = card;
    $scope.data.imageLoadFailure = false;
  };

  $scope.getFilter = function() {
      return JSON.stringify($scope.filter);
  };


  /**
   * This is the basic structure of filters. They can be
   * either a 'group' (in which case it has sub-rules) or a 'condition'
   * in which case it matches a given field with given data
   */
  $scope.filter = {
    group: {
      operator: 'AND',
      rules: [
        {
          condition: 'has',
          field: 'gametext',
          data: ''
        },
        {
          condition: 'has',
          field: 'gametext',
          data: ''
        }
      ]
    }
  };

  $scope.search = {
    side: "ALL",
    type: "ALL",
    searchField: "TITLE",
    text: ""
  };

  $scope.done = function() {
    alert("done!");
  };

  $scope.advancedSearchBuilder = function() {
    $scope.data.showAdvancedSearch = true;
  };



  /**
   * Build up a list of all requirements from the left-hand pane
   * Store them as an array of requirements in the filter-format
   */
  function getBasicAndSearches() {

    var andSearches = [];

    /*
    group: {
      operator: 'AND',
      rules: [
        {
          condition: 'has',
          field: 'gametext',
          data: ''
        },
        {
          condition: 'has',
          field: 'gametext',
          data: ''
        }
      ]
    }
    */

    var searchText = $scope.search.text.toLowerCase().trim();

    // Specific Search Fields
    if (searchText !== "" && $scope.search.searchField === "ALL") {
      andSearches.push({
        group: {
          operator: 'OR',
          rules: [
            {
              condition: 'has',
              field: 'gametext',
              data: searchText
            },
            {
              condition: 'has',
              field: 'lore',
              data: searchText
            },
            {
              condition: 'has',
              field: 'title',
              data: searchText
            },

          ]
        }
      });
    }
    if (searchText !== "" && $scope.search.searchField === "GAMETEXT") {
      andSearches.push({
        condition: 'has',
        field: 'gametext',
        data: searchText
      });
    }
    if (searchText !== "" && $scope.search.searchField === "LORE") {
      andSearches.push({
        condition: 'has',
        field: 'lore',
        data: searchText
      });
    }
    if (searchText !== "" && $scope.search.searchField === "TITLE") {
      andSearches.push({
        condition: 'has',
        field: 'title',
        data: searchText
      });
    }


    if ($scope.search.type !== "ALL") {
      var requiredType = CDFService.getTypeSearchStringFromType($scope.search.type);
      andSearches.push({
        condition: 'has',
        field: 'type',
        data: requiredType
      });
    }

    if ($scope.search.side === "LIGHT") {
      andSearches.push({
        condition: 'has',
        field: 'side',
        data: "LS"
      });
    }
    if ($scope.search.side === "DARK") {
      andSearches.push({
        condition: 'has',
        field: 'side',
        data: "DS"
      });
    }

    return andSearches;
  }


  /*
   * Build the search parameters based on the left-hand panel
   * and optionally advanced settings!
   */
  function buildCumulativeSearch(includeAdvancedSearch) {

    var basicSearches = getBasicAndSearches();
    var cumulativeSearch = {
      group: {
        operator: "AND",
        rules: basicSearches
      }
    };

    if (includeAdvancedSearch) {
      cumulativeSearch.group.rules.push($scope.filter);
    }

    return cumulativeSearch;
  }

  $scope.swallowClick = function($event) {
    $event.stopPropagation();
  };

  $scope.cancelAdvanced = function() {
    $scope.data.showAdvancedSearch = false;
  };


  $scope.toggleExtraData = function() {
    $scope.data.showExtraData = !$scope.data.showExtraData;
  };

  function addCardsFromCdfData(data) {
    var cards = CDFService.cardsFromCdfData(data);
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      $scope.data.cardList.push(card);
    }
  }

  $http.get('lightside.cdf').success(function(data) {
    addCardsFromCdfData(data);
    $scope.data.loadingLight = false;

    loadSwipData();
  });

  $http.get('darkside.cdf').success(function(data) {
    addCardsFromCdfData(data);
    $scope.data.loadingDark = false;

    loadSwipData();
  });

  function loadSwipData() {
    // Only load SWIP data after we've loaded both the light and dark CDFs
    if ($scope.data.loadingDark || $scope.data.loadingLight) {
      return;
    }

    $http.get('swipdump.text').success(function(data) {
      SWIPService.addSwipDataFromSwipDump(data, $scope.data.cardList);
    });

    // For small screens (probably mobile), hide the extra data by default
    var w = angular.element($window);
    if (w.width() < 800) {
      $scope.data.showExtraData = false;
    }
  }

  $scope.searchIfNotEmpty = function() {
    if ($scope.search.text.trim() !== "") {
      $scope.doSearch();
    }
  };


  /**
   * Compare the given field, returning true on match and false otherwise
   */
  function compareFields(card, fieldName, compareType, value) {
    /*
    { name: '=' },
    { name: '<>' },
    { name: '<' },
    { name: '<=' },
    { name: '>' },
    { name: '>=' },
    { name: 'has'}
    */

    if (compareType === '=') {
      return card[fieldName] == value; //jshint ignore:line
    } else if (compareType === '<>') {
      return card[fieldName] != value; //jshint ignore:line
    } else if (compareType === '<') {
      return card[fieldName] < value; //jshint ignore:line
    } else if (compareType === '<=') {
      return card[fieldName] <= value; //jshint ignore:line
    } else if (compareType === '>') {
      return card[fieldName] > value; //jshint ignore:line
    } else if (compareType === '>=') {
      return card[fieldName] >= value; //jshint ignore:line
    } else if (compareType === 'has') {
      return -1 !== card[fieldName].toLowerCase().indexOf(value.toLowerCase()); //jshint ignore:line
    } else {
      console.error("Unknown compare type: " + compareType);
      return false;
    }

  }


  /**
   * Get a list of all cards that exist in either list #1 or list #2
   */
  function getCardsInAnyList(list1, list2) {
    var cumulativeCards = [];

    var i = 0;
    var card = null;

    for (i = 0; i < list1.length; i++) {
      card = list1[i];
      addCardToList(card, cumulativeCards);
    }

    for (i = 0; i < list2.length; i++) {
      card = list2[i];
      addCardToList(card, cumulativeCards);
    }

    return cumulativeCards;
  }


  /**
   * Adds a card to the given list
   */
  function addCardToList(card, list) {
    var alreadyExists = false;
    for (var j = 0; j < list.length; j++) {
      var existingCard = list[j];
      if (existingCard.title === card.title) {
        alreadyExists = true;
        break;
      }
    }

    if (!alreadyExists) {
      list.push(card);
    }
  }


  /**
   * Find all cards that exist in both list #1 and list #2
   */
  function getCardsInBothLists(list1, list2) {
    var cardsInBothLists = [];
    for (var i = 0; i < list1.length; i++) {
      var card1 = list1[i];

      for (var j = 0; j < list2.length; j++) {
        var card2 = list2[j];
        if (!card2 || !card1) {
          console.log("error: bad card????");
        }

        if (card2.title === card1.title) {
          cardsInBothLists.push(card2);
          break;
        }
      }
    }
    return cardsInBothLists;
  }


  /**
   * Match cards based on a given rule
   */
  function getCardsMatchingSimpleRule(rule) {

    var matches = [];
    for (var i = 0; i < $scope.data.cardList.length; i++) {
      var card = $scope.data.cardList[i];

      // Empty field. Just ignore it!
      if (rule.data === "") {
        matches.push(card);
        continue;
      }

      if (compareFields(card, rule.field, rule.condition, rule.data)) {
        matches.push(card);
      }
    }
    return matches;
  }


  /**
   * Match cards based on a group of data
   */
  function getCardsMatchingRuleGroup(group) {
    // Evaluate the group of rules using AND or OR
    var firstRule = true;
    var cumulativeCardsMatchingRules = [];

    for (var i = 0; i < group.rules.length; i++) {
      var subRule = group.rules[i];
      var cardsMatchingRule = getCardsMatchingRule(subRule);

      if (group.operator === "AND") {
        if (firstRule) {
          cumulativeCardsMatchingRules = cardsMatchingRule;
          firstRule = false;
        }
        cumulativeCardsMatchingRules = getCardsInBothLists(cumulativeCardsMatchingRules, cardsMatchingRule);
      } else if (group.operator === "OR") {
        cumulativeCardsMatchingRules = getCardsInAnyList(cumulativeCardsMatchingRules, cardsMatchingRule);
      }
    }
    return cumulativeCardsMatchingRules;
  }


  /**
   * Get cards that match a given rule (may be complex or simple)
   */
  function getCardsMatchingRule(rule) {

    if (rule.condition) {

      // This is a specific condition, not another rule
      return getCardsMatchingSimpleRule(rule);

    } else if (rule.group) {

      return getCardsMatchingRuleGroup(rule.group);
    }
  }


  /**
   * Perform a basic search
   */
  $scope.doSearch = function() {
    var includeAdvancedSearch = false;
    var cumulativeSearch = buildCumulativeSearch(includeAdvancedSearch);
    performSearchAndDisplayResults(cumulativeSearch);
  };


  /**
   * Perform an advanced search
   */
  $scope.doAdvancedSearch = function() {
    var includeAdvancedSearch = true;
    var cumulativeSearch = buildCumulativeSearch(includeAdvancedSearch);
    performSearchAndDisplayResults(cumulativeSearch);
  };


  /**
   * Perform the given search and update the search results pane
   */
  function performSearchAndDisplayResults(searchCriteria) {
    $scope.data.noResultsFound = false;
    $scope.data.performedSearch = true;

    var matchingCards = getCardsMatchingRule(searchCriteria);
    $scope.data.matches = matchingCards;

    if ($scope.data.matches.length === 0) {
      $scope.data.noResultsFound = true;
    } else {
      $scope.data.noResultsFound = false;
    }

    $scope.data.matches.sort('title');
    $scope.data.showAdvancedSearch = false;
  }


  $scope.onImageLoadError = function() {
    console.error("Error loading image!");
    $scope.data.imageLoadFailure = true;
  };

  $scope.swallow = function($event) {
    $event.stopPropagation();
  };

}]);
