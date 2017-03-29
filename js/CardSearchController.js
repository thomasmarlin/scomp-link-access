'use strict';
var cardSearchApp = angular.module('cardSearchApp');
cardSearchApp.controller('CardSearchController', ['$scope', '$http', 'CDFService',  function($scope, $http, CDFService) {

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
    textOnly: false
  };

  $scope.selectCard = function(card) {
    $scope.data.selectedCard = card;
    $scope.data.imageLoadFailure = false;
  };

  $scope.getFilter = function() {
      return JSON.stringify($scope.filter);
  };

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

  $scope.swallowClick = function($event) {
    $event.stopPropagation();
  };

  $scope.cancelAdvanced = function() {
    $scope.data.showAdvancedSearch = false;
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
  });

  $http.get('darkside.cdf').success(function(data) {
    addCardsFromCdfData(data);
    $scope.data.loadingDark = false;
  });

  $scope.searchIfNotEmpty = function() {
    if ($scope.search.text.trim() !== "") {
      $scope.doSearch();
    }
  };

  $scope.doAdvancedSearch = function() {

    $scope.data.noResultsFound = false;
    $scope.data.performedSearch = true;

    var matchingCards = getCardsMatchingRule($scope.filter);
    $scope.data.matches = matchingCards;

    if ($scope.data.matches.length === 0) {
      $scope.data.noResultsFound = true;
    }

    $scope.data.matches.sort('title');

    $scope.data.showAdvancedSearch = false;
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

  $scope.doSearch = function() {
    $scope.data.matches = [];
    $scope.data.performedSearch = true;
    $scope.data.noResultsFound = false;


    //
    // Build search parameters
    //

    var requiredType = "";
    var requiredSide = "";

    var searchGametext = false;
    var searchLore = false;
    var searchTitle = false;
    var searchRequiredType = false;
    var searchRequiredSide = false;

    if ($scope.search.searchField === "ALL") {
      searchGametext = true;
      searchLore = true;
      searchTitle = true;
    }
    if ($scope.search.searchField === "GAMETEXT") {
      searchGametext = true;
    }
    if ($scope.search.searchField === "LORE") {
      searchLore = true;
    }
    if ($scope.search.searchField === "TITLE") {
      searchTitle = true;
    }

    if ($scope.search.type !== "ALL") {
      searchRequiredType = true;
      requiredType = CDFService.getTypeSearchStringFromType($scope.search.type);
    }

    if ($scope.search.side === "LIGHT") {
      searchRequiredSide = true;
      requiredSide = "LS";
    }
    if ($scope.search.side === "DARK") {
      searchRequiredSide = true;
      requiredSide = "DS";
    }


    //
    // Perform the actual search
    //

    var searchText = $scope.search.text.toLowerCase().trim();
    for (var i = 0; i < $scope.data.cardList.length; i++) {
      var card = $scope.data.cardList[i];

      var matchedText = false;
      var matchedType = false;
      var matchedSide = false;


      // Query by Type
      if (!searchRequiredType) {
        matchedType = true;
      } else {
        if (-1 !== card.type.toLowerCase().indexOf(requiredType)) {
          matchedType = true;
        }
      }

      // Query by Side
      if (!searchRequiredSide) {
        matchedSide = true;
      } else {
        if (card.side === requiredSide) {
          matchedSide = true;
        }
      }


      // Query by gametext
      if (searchGametext) {
        if (-1 !== card.gametext.toLowerCase().indexOf(searchText)) {
          matchedText = true;
        }
      }


      // Query by Lore
      if (searchLore) {
        if (-1 !== card.lore.toLowerCase().indexOf(searchText)) {
          matchedText = true;
        }
      }


      // Query by Title
      if (searchTitle) {
        if (-1 !== card.title.toLowerCase().indexOf(searchText)) {
          matchedText = true;
        }
      }

      // See if any of the matches were successful
      if (matchedText && matchedType && matchedSide) {
        $scope.data.matches.push(card);
      }
    }


    if ($scope.data.matches.length === 0) {
      $scope.data.noResultsFound = true;
    }

    $scope.data.matches.sort('title');

  };

  $scope.onImageLoadError = function() {
    console.error("Error loading image!");
    $scope.data.imageLoadFailure = true;
  };


  $scope.swallow = function($event) {
    $event.stopPropagation();
  };

}]);
