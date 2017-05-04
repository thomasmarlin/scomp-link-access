"use strict";
var cardSearchApp = angular.module('cardSearchApp');
cardSearchApp.service('CDFService', [function() {

  /*
  var CARD_TYPES = {
    ALL: "ALL",
    ADMIRALS_ORDER: "ADMIRALS_ORDER",
    CHARACTER: "CHARACTER",
    CREATURE: "CREATURE",
    DEVICE: "DEVICE",
    DEFENSIVE_SHIELD: "DEFENSIVE_SHIELD",
    EFFECT: "EFFECT",
    EPIC_EVENT: "EPIC_EVENT",
    INTERRUPT: "INTERRUPT",
    JEDI_TEST: "JEDI_TEST",
    LOCATION: "LOCATION",
    OBJECTIVE: "OBJECTIVE",
    STARSHIP: "STARSHIP",
    VEHICLE: "VEHICLE",
    WEAPON: "WEAPON",
    UNKNOWN: "UNKNOWN"
  };
  */

  var CARD_TYPE_SEARCH_STRING = {
    ADMIRALS_ORDER: "admiral",
    CHARACTER: "character",
    CREATURE: "creature",
    DEVICE: "device",
    DEFENSIVE_SHIELD: "defensive",
    EFFECT: "effect",
    EPIC_EVENT: "epic",
    INTERRUPT: "interrupt",
    JEDI_TEST: "jedi test",
    LOCATION: "location",
    OBJECTIVE: "objective",
    STARSHIP: "starship",
    VEHICLE: "vehicle",
    WEAPON: "weapon"
  };


  this.getTypeSearchStringFromType = function(cardTypeEnum) {
    if (CARD_TYPE_SEARCH_STRING[cardTypeEnum]) {
      return CARD_TYPE_SEARCH_STRING[cardTypeEnum];
    }
    return "";
  };

  function cardsFromCdfData(data) {
    var cards = [];

    // By lines
    var lines = data.split('\n');
    for(var line = 0; line < lines.length; line++){
      var lineInfo = lines[line];

      if (0 === lineInfo.indexOf("card")) {
        //console.log("Detected Card: " + lineInfo);

        // Ignore Legacy cards
        if (-1 !== lineInfo.indexOf('card "/legacy')) {
          continue;
        }
        if (-1 !== lineInfo.indexOf('card "/TWOSIDED/legacy')) {
          continue;
        }

        // Get the card name from the line
        var card = cardFromLine(lineInfo);
        if (card) {
          //console.log("Card: " + JSON.stringify(card));
          cards.push(card);
        }
      }
    }

    return cards;
  }
  this.cardsFromCdfData = cardsFromCdfData;

  function fixSlashes(str) {
    return str;
    /*
    while (str.indexOf('/') !== -1) {
      str = str.replace('/', '\\');
    }
    return str;
    */
  }

  function cardFromLine(cardLine) {

    if (cardLine.indexOf("card") !== 0) {
      return null;
    }

    var twoSided = false;
    if (cardLine.indexOf('TWOSIDED') !== 0) {
      twoSided = true;
    }

    var card = {
      links: [],
      links_large: [],
      ability: "",
      armor: "",
      characteristics: "",
      darkSideIcons: "",
      destiny: "",
      deploy: "",
      forfeit: "",
      lore: "",
      gametext: "",
      hyperspeed: "",
      landspeed: "",
      lightSideIcons: "",
      maneuver: "",
      parsec: "",
      politics: "",
      power: "",
      title: "",
      titleSortable: "",
      titleLower: "",
      type: "",
      set: "",
      setAbbreviation: "",
      side: "",
      subType: "",
      twoSided: twoSided,
      uniqueness: ""
    };


    // Full Line:
    // card "/starwars/DeathStarII-Dark/t_accuser" "Accuser (1)\nDark Starship - Capital: Imperial-Class Star Destroyer [R]\nSet: Death Star II\nPower: 7 Armor: 5 Hyperspeed: 4\nDeploy: 8 Forfeit: 9\nIcons: Pilot, Nav Computer, Scomp Link\n\nLore: Modified for optimal crisis response time. Veteran crew experienced at monitoring shipping lanes and Imperial port traffic.\n\nText: May deploy -3 as a 'react'. May add 6 pilots, 8 passengers, 2 vehicles and 4 TIEs. Has ship-docking capability. Permanent pilot provides ability of 1."
    var iFirstSpace = cardLine.indexOf(" ");
    var iSecondSpace = cardLine.indexOf(" ", iFirstSpace + 1);
    processLinks(cardLine, card);

    var cardData = cardLine.substring(iSecondSpace + 2).trim();

    // Every decent browser can handle this...but not IE. See below...
    cardData = cardData.replace("\"\�", "•"); //jshint ignore:line
    cardData = cardData.replace("\�", "•"); //jshint ignore:line
    cardData = cardData.replace("\�", "•"); //jshint ignore:line
    cardData = cardData.replace("\�", "•"); //jshint ignore:line

    // For Internet Explorer stupidity (replace any garbage characters with  the uniqueness-dot
    cardData = cardData.replace(/[^\x00-\x80]/g, "•"); // //jshint ignore:line

    // Split Lines
    // "Accuser (1)\n
    // Dark Starship - Capital: Imperial-Class Star Destroyer [R]\n
    // Set: Death Star II\n
    // Power: 7 Armor: 5 Hyperspeed: 4\n
    // Deploy: 8 Forfeit: 9\n
    // Icons: Pilot, Nav Computer, Scomp Link\n\n
    // Lore: Modified for optimal crisis response time. Veteran crew experienced at monitoring shipping lanes and Imperial port traffic.\n\n
    // Text: May deploy -3 as a 'react'. May add 6 pilots, 8 passengers, 2 vehicles and 4 TIEs. Has ship-docking capability. Permanent pilot provides ability of 1."

    // Split the card into it's fields
    var cardFields = cardData.split("\\n");
    for (var j = 0; j < cardFields.length; j++) {
      if (j === 0) {
        processTitleLine(cardFields[j].trim(), card);
      } else if (j === 1) {
        processTypeLine(cardFields[j].trim(), card);
      } else {
        processLabeledLine(cardFields[j].trim(), card);
      }
    }

    return card;
  }



  function getPathChunk(cardLine) {
    // card "/legacy/Virtual9-Dark/t_arenaexecution" "Arena Execution...
    var iFirstSpace = cardLine.indexOf(" ");
    var iSecondSpace = cardLine.indexOf(" ", iFirstSpace + 1);
    var cardPathChunk = cardLine.substring(iFirstSpace+2, iSecondSpace-1);
    return cardPathChunk;
  }

  function processLinks(cardLine, card) {
    var cardPathChunk = getPathChunk(cardLine);
    cardPathChunk = fixSlashes(cardPathChunk);

    var files = [];
    var front = null;
    var back = null;

    var file1Start = cardPathChunk.indexOf("t_");
    var folderString = cardPathChunk.substring(0, file1Start);

    // Remove the TWOSIDED indicator
    folderString = folderString.replace("TWOSIDED/", "");
    var iLastFolderSlash = folderString.lastIndexOf('/');

    var folderStringLarge = folderString.slice(0, iLastFolderSlash) + "/large/" + folderString.slice(iLastFolderSlash+1);

    var allFilesString = cardPathChunk.substring(file1Start);
    var iSecondImageDivider = allFilesString.indexOf("\/");
    if (iSecondImageDivider !== -1) {
      // This is a two-sided card!
      front = allFilesString.substring(0, iSecondImageDivider);
      back = allFilesString.substring(iSecondImageDivider+1);
      files.push(front);
      files.push(back);
    } else {
      front = allFilesString;
      files.push(front);
    }

    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      var link = "cards" + folderString + file.trim() + ".gif";
      card.links.push(link);

      var largeLink = "cards" + folderStringLarge + file.trim() + ".gif";
      largeLink = largeLink.replace("t_", "");
      card.links_large.push(largeLink);
    }

  }


  function processTypeLine(line, card) {
    // Dark Starship - Capital: Imperial-Class Star Destroyer [R]\n

    var indexOfRarity = line.lastIndexOf("[");
    var lastBracketIndex = line.lastIndexOf("]");
    if ((indexOfRarity !== -1) && (lastBracketIndex !== -1)) {

      // Get Rarity
      card.rarity = line.substring(indexOfRarity+1, lastBracketIndex);

      var fullTypeLine = line.substring(0, indexOfRarity).trim();

      // Get Basic Type
      var endOfBaseType = fullTypeLine.length;
      var indexOfDash = fullTypeLine.indexOf('-');
      if (indexOfDash > -1) {
        endOfBaseType = indexOfDash;
      }

      var type = fullTypeLine.substring(0, endOfBaseType).trim();
      if (type.indexOf("Dark") === 0) {
        card.side = "Dark";
      }
      if (type.indexOf("Light") === 0){
        card.side = "Light";
      }

      type = type.replace("Dark", "").trim();
      type = type.replace("Light", "").trim();
      card.type = type;


      // Get Full Type
      card.subType = fullTypeLine.substring(endOfBaseType + 1).replace("Dark", "").replace("Light", "").trim();

    }

  }

  function getSimpleName(cardName) {
    var titleSortable = cardName.replace("•", "");
    titleSortable = titleSortable.replace("•", "");
    titleSortable = titleSortable.replace("•", "");
    titleSortable = titleSortable.replace("•", "");
    titleSortable = titleSortable.toLowerCase();
    return titleSortable;
  }
  this.getSimpleName = getSimpleName;

  function processTitleLine(line, card) {
    card.title = line.trim();

    var iDestinyStart = line.lastIndexOf('(');
    var iDestinyEnd = line.lastIndexOf(')');
    if ((iDestinyStart !== -1) && (iDestinyEnd !== -1)) {
      card.title = line.substring(0, iDestinyStart-1).trim();
      card.destiny = line.substring(iDestinyStart+1, iDestinyEnd);
    }
    card.titleSortable = getSimpleName(card.title);
    card.titleLower = card.titleSortable;
  }


  function processLabeledLine(line, card){

    // Handle the full special lines first!
    if (line.indexOf("Text:") === 0) {
      card.gametext += line.substring(6).trim();
      return;
    } else if (line.indexOf("Lore:") === 0) {
      card.lore += line.substring(6).trim();
      return;
    } else if (line.indexOf("Set:") === 0) {
      card.set = line.substring(5).trim();
      card.setAbbreviation = getSetAbbreviation(card.set);
      return;
    } else if (line.indexOf("LOST:") === 0) {
      card.gametext += "LOST: " + line.substring(6).trim() + "  ";
      return;
    } else if (line.indexOf("USED:") === 0) {
      card.gametext += "USED: " + line.substring(6).trim() + "  ";
      return;
    } else if (card.type === "Objective") {
      // Special case because Objectives aren't labeled properly... sigh...
      card.gametext += line;
    }

    // Power: 7 Armor: 5 Hyperspeed: 4\n
    // Split the line by 'spaces', so:
    // Power:
    // 7
    // Armor:
    // 5

    var splitLine = line.trim().split(" ");
    var lastFieldNameLower = "";
    for (var i = 0; i < splitLine.length; i++) {
      var data = splitLine[i].trim();

      if (i % 2 !== 0) {
        if (lastFieldNameLower === "power:") {
          card.power = data;
        } else if (lastFieldNameLower === "maneuver:") {
          card.maneuver = data;
        } else if (lastFieldNameLower === "armor:") {
          card.armor = data;
        } else if (lastFieldNameLower === "hyperspeed:") {
          card.hyperspeed = data;
        } else if (lastFieldNameLower === "landspeed:") {
          card.landspeed = data;
        } else if (lastFieldNameLower === "deploy:") {
          card.deploy = data;
        } else if (lastFieldNameLower === "forfeit:") {
          card.forfeit = data;
        } else if (lastFieldNameLower === "ability:") {
          card.ability = data;
        } else if (lastFieldNameLower === "influence:") {
          card.influence = data;
        } else if (lastFieldNameLower === "ferocity:") {
          card.ferocity = data;
        } else if (lastFieldNameLower === "used:") {
          card.gametext += "USED:  " + data + "\n";
        } else if (lastFieldNameLower === "lost:") {
          card.gametext += "LOST: " + data + "\n";
        } else if (lastFieldNameLower === "starting:") {
          card.gametext += "STARTING: " + data + "\n";
        } else if (lastFieldNameLower === "politics:") {
          card.politics = data;
        } else if (lastFieldNameLower === "parsec:") {
          card.parsec = data;
        }


      } else{
        lastFieldNameLower = data.toLowerCase().trim();
      }
    }
  }

  function getSetAbbreviation(setName) {
    switch (setName) {
      case "Premier": {
        return "PR";
      }
      case "A New Hope": {
        return "ANH";
      }
      case "Dagobah": {
        return "DAG";
      }
      case "Jabba's Palace": {
        return "JP";
      }
      case "Cloud City": {
        return "CC";
      }
      case "Special Edition": {
        return "SE";
      }
      case "Endor": {
        return "EDR";
      }
      case "Death Star II": {
        return "DS2";
      }
      case "Tatooine": {
        return "TAT";
      }
      case "Coruscant": {
        return "COR";
      }
      case "Theed Palace": {
        return "TP";
      }
      case "Reflections I": {
        return "Ref1";
      }
      case "Reflections II": {
        return "Ref2";
      }
      case "Reflections III": {
        return "Ref3";
      }
      case "Demo Deck": {
        return "Demo";
      }
      default: {
        var abbreviation = "";
        var splitWords = setName.split(" ");
        for (var i = 0; i < splitWords.length; i++) {
          var firstLetter = splitWords[i].substring(0, 1);
          abbreviation += firstLetter.toUpperCase();
        }
        return abbreviation;
      }
    }


  }



  /**
   * Builds a mapping of:
   * {
   *   'type"; ["interrupt", "effect", "character"],
   *   'subType"; ["used interrupt", "utinni effect", "rebel', 'alient'],
   *   'characteristics': [ 'Black Sun Agent', 'ISB Agent', ...],
   *   'side': [ 'light', 'dark']
   *   'set': ['Tatooine', 'Death Star II', etc]
   *   ...
   * }
   */
  function getCardValueMap(cards) {
    var anyCard = cards[0];

    var fieldValueMap = {};

    // Add every field we know about
    for (var field in anyCard) { //jshint ignore:line
      fieldValueMap[field] = null;
    }

    // Add auto-complete to specific fields
    fieldValueMap.type = getValuesForFieldName('type', cards);
    fieldValueMap.subType = getValuesForFieldName('subType', cards);
    fieldValueMap.characteristics = getValuesForFieldName('characteristics', cards);
    fieldValueMap.side = getValuesForFieldName('side', cards);
    fieldValueMap.set = getValuesForFieldName('set', cards);
    fieldValueMap.uniqueness = getValuesForFieldName('uniqueness', cards);
    fieldValueMap.darkSideIcons = getValuesForFieldName('darkSideIcons', cards);
    fieldValueMap.lightSideIcons = getValuesForFieldName('lightSideIcons', cards);

    return fieldValueMap;
  }
  this.getCardValueMap = getCardValueMap;


  function splitValuesFromString(str) {

    while (str.indexOf(".") !== -1) {
      str = str.replace(".", "<br>");
    }
    while (str.indexOf(",") !== -1) {
      str = str.replace(",", "<br>");
    }


    // SWIP has values split by \par.  The SWIPService changes them into
    // breaks using <br>.  Now, we want to split these into their sub-values
    var values = str.split("<br>");
    var nonEmptyValues = [];
    for (var i = 0; i < values.length; i++) {
      var val = values[i].trim();
      if (val !== "") {
        nonEmptyValues.push(val);
      }
    }

    return nonEmptyValues;
  }

  function getValuesForFieldName(fieldName, cards) {

    // Keep a hash for quick access
    /*
    var possibleValues = {
      'Black Sun Agent': true,
      'ISB Agent': true
    };
    */
    var possibleValues = {};

    // Get possibilities for each card
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card[fieldName] && card[fieldName] !== "") {
        var cardValueString = card[fieldName];
        var values = splitValuesFromString(cardValueString);

        for (var j = 0; j < values.length; j++) {
          var value = values[j].toLowerCase();
          possibleValues[value] = true;
        }

      }
    }

    // Now, consolidate all of those values into an array
    var possibleValueArray = [];
    for (var val in possibleValues) { //jshint ignore:line
      possibleValueArray.push(val);
    }
    return possibleValueArray;
  }
  this.getValuesForFieldName = getValuesForFieldName;
}]);
