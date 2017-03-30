"use strict";
var cardSearchApp = angular.module('cardSearchApp');
cardSearchApp.service('SWIPService', ['CDFService', function(CDFService) {

  /*
    id int,
    CardName text,
    Pulls text,
    IsPulled text,
    Counterpart char(50),
    Combo text,
    Matching char(50),
    MatchingWeapon char(50),
    Rules text,
    Cancels text,
    IsCanceledBy text,
    Inventory int,
    Needs int,
    ExpansionV VARCHAR(40),
    Influence char(4),
    Grabber char(4),
    Errata char(4),
    CardNameV char(80),
    UniquenessV char(6));
  */

  var nameHeaderIndex = -1;
  var pullsHeaderIndex = -1;
  var isPulledHeaderIndex = -1;
  var counterpartHeaderIndex = -1;
  var comboHeaderIndex = -1;
  var matchingHeaderIndex = -1;
  var matchingWeaponHeaderIndex = -1;
  var isCanceledByHeaderIndex = -1;
  var cancelsHeaderIndex = -1;
  var abreviationHeaderIndex = -1;


  function getCardName(splitData) {
    if (nameHeaderIndex !== -1) {
      return splitData[nameHeaderIndex];
    }
    return "";
  }
  function getPulls(splitData) {
    if (pullsHeaderIndex !== -1) {
      return splitData[pullsHeaderIndex];
    }
    return "";
  }
  function getPulledBy(splitData) {
    if (isPulledHeaderIndex !== -1) {
      return splitData[isPulledHeaderIndex];
    }
    return "";
  }
  function getCounterpart(splitData) {
    if (counterpartHeaderIndex !== -1) {
      return splitData[counterpartHeaderIndex];
    }
    return "";
  }
  function getCombo(splitData) {
    if (comboHeaderIndex !== -1) {
      return splitData[comboHeaderIndex];
    }
    return "";
  }
  function getMatching(splitData) {
    if (matchingHeaderIndex !== -1) {
      return splitData[matchingHeaderIndex];
    }
    return "";
  }
  function getMatchingWeapon(splitData) {
    if (matchingWeaponHeaderIndex !== -1) {
      return splitData[matchingWeaponHeaderIndex];
    }
    return "";
  }
  function getCanceledBy(splitData) {
    if (isCanceledByHeaderIndex !== -1) {
      return splitData[isCanceledByHeaderIndex];
    }
    return "";
  }
  function getCancels(splitData) {
    if (cancelsHeaderIndex !== -1) {
      return splitData[cancelsHeaderIndex];
    }
    return "";
  }
  function getAbbreviations(splitData) {
    if (abreviationHeaderIndex !== -1) {
      return splitData[abreviationHeaderIndex];
    }
    return "";
  }


  function getCardWithName(name, existingCards) {
    var simpleName = CDFService.getSimpleName(name);
    for (var i = 0; i < existingCards.length; i++) {
      var existingCard = existingCards[i];
      if (existingCard.titleSortable === simpleName) {
        return existingCard;
      }
    }
    return null;
  }


  function processHeaders(firstLine) {
    var headers = firstLine.split('|');
    nameHeaderIndex = headers.indexOf('CardName');
    pullsHeaderIndex = headers.indexOf('Pulls');
    isPulledHeaderIndex = headers.indexOf('IsPulled');
    counterpartHeaderIndex = headers.indexOf('Counterpart');
    comboHeaderIndex = headers.indexOf('Combo');
    matchingHeaderIndex = headers.indexOf('Matching');
    matchingWeaponHeaderIndex = headers.indexOf('MatchingWeapon');
    cancelsHeaderIndex = headers.indexOf('Cancels');
    isCanceledByHeaderIndex = headers.indexOf('IsCanceledBy');
    abreviationHeaderIndex = headers.indexOf('Abbreviation');
  }

  function addSwipDataFromSwipDump(data, existingCards) {
    var cards = [];

    // By lines
    var lines = data.split('\n');

    // Get the Headers first
    var firstLine = lines[0];
    processHeaders(firstLine);

    // Process each data line
    for(var line = 1; line < lines.length; line++){
      var cardLine = lines[line];
      cardLine = fixNewlines(cardLine);

      var cardDataFields = cardLine.split('|');
      var cardName = getCardName(cardDataFields);
      if (!cardName) {
        continue;
      }

      var existingCard = getCardWithName(cardName, existingCards);
      if (existingCard) {
        // Add the extra data from SWIP!!
        existingCard.pulls = getPulls(cardDataFields);
        existingCard.pulledBy = getPulledBy(cardDataFields);
        existingCard.counterpart = getCounterpart(cardDataFields);
        existingCard.combo = getCombo(cardDataFields);
        existingCard.matching = getMatching(cardDataFields);
        existingCard.matchingWeapon = getMatchingWeapon(cardDataFields);
        existingCard.canceledBy = getCanceledBy(cardDataFields);
        existingCard.cancels = getCancels(cardDataFields);
        existingCard.abbreviation = getAbbreviations(cardDataFields);
      }

    }

    return cards;
  }
  this.addSwipDataFromSwipDump = addSwipDataFromSwipDump;

  function fixNewlines(line) {
    while (line.indexOf("\\par") !== -1) {
      line = line.replace("\\par", "<br>");
    }
    return line;
  }

}]);
