'use strict';
var cardSearchApp = angular.module('cardSearchApp', ['ngAnimate', 'ui.bootstrap', 'ui.bootstrap.tabs', 'angularSpinner']).config(function($locationProvider) { $locationProvider.html5Mode({enabled: true, requireBase: false}); });
cardSearchApp.controller('CardSearchController', ['$scope', '$http', 'CDFService',  function($scope, $http, CDFService) {

  $scope.data = {
    matches: [],
    cardList: [],
    loadingLight: true,
    loadingDark: true,
    performedSearch: false,
    noResultsFound: false,
    selectedCard: null,
    mode: "IMAGE" // "TEXT"
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

    if ($scope.search.type != "ALL") {
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

  $scope.swallow = function($event) {
    $event.stopPropagation();
  }

}]);
