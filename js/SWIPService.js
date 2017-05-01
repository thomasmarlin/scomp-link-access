"use strict";
var cardSearchApp = angular.module('cardSearchApp');
cardSearchApp.service('SWIPService', ['CDFService', function(CDFService) {

  /*
  * To get data out of SWIP:
    1) Compile sqlite2  (3 does NOT work with the db)
    2) ./sqlite -header swccg_db.sdb "select id,CardName,Uniqueness,Characteristics,Pulls,LightSideIcons,DarkSideIcons,IsPulled,Counterpart,Combo,Matching,MatchingWeapon,Cancels,IsCanceledBy from SWD;" > swipdump.text
  */

  // Added
  /*
  Characteristics
  LightSideIcons
  DarkSideIcons
  Uniqueness

  */

  // id|CardName|Grouping|CardType|Subtype|ModelType|Expansion|Rarity|Uniqueness|Characteristics|Destiny|Power|Ferocity|CreatureDefenseValue|CreatureDefenseValueName|ObjectiveFront|ObjectiveBack|ObjectiveFrontName|ObjectiveBackName|Deploy|Forfeit|Armor|Ability|Hyperspeed|Landspeed|Politics|Maneuver|ForceAptitude|Lore|Gametext|JediTestNumber|LightSideIcons|DarkSideIcons|LightSideText|DarkSideText|Parsec|Icons|Planet|Space|Mobile|Interior|Exterior|Underground|Creature|Vehicle|Starship|Underwater|Pilot|Warrior|Astromech|PermanentWeapon|SelectiveCreature|Independent|ScompLink|Droid|TradeFederation|Republic|Episode1|Information|Abbreviation|Pulls|IsPulled|Counterpart|Combo|Matching|MatchingWeapon|Rules|Cancels|IsCanceledBy|Inventory|Needs|ExpansionV|Influence|Grabber|Errata|CardNameV|UniquenessV

  /*
  id|
  CardName|
  Grouping|
  CardType|
  Subtype|
  ModelType|
  Expansion|
  Rarity|
  Uniqueness|
  Characteristics|
  Destiny|
  Power|
  Ferocity|
  CreatureDefenseValue|
  CreatureDefenseValueName|
  ObjectiveFront|
  ObjectiveBack|
  ObjectiveFrontName|
  ObjectiveBackName|
  Deploy|
  Forfeit|
  Armor|
  Ability|
  Hyperspeed|
  Landspeed|
  Politics|
  Maneuver|
  ForceAptitude|
  Lore|
  Gametext|
  JediTestNumber|
  LightSideIcons|
  DarkSideIcons|
  LightSideText|
  DarkSideText|
  Parsec|
  Icons|
  Planet|
  Space|
  Mobile|
  Interior|
  Exterior|
  Underground|
  Creature|
  Vehicle|
  Starship|
  Underwater|
  Pilot|
  Warrior|
  Astromech|
  PermanentWeapon|
  SelectiveCreature|
  Independent|
  ScompLink|
  Droid|
  TradeFederation|
  Republic|
  Episode1|
  Information|
  Abbreviation|
  Pulls|
  IsPulled|
  Counterpart|
  Combo|
  Matching|
  MatchingWeapon|
  Rules|
  Cancels|
  IsCanceledBy|
  Inventory|
  Needs|
  ExpansionV|
  Influence|
  Grabber|
  Errata|
  CardNameV|
  UniquenessV
  */



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
  var characteristicsHeaderIndex = -1;
  var lightSideIconsHeaderIndex = -1;
  var darkSideIconsHeaderIndex = -1;
  var uniquenessHeaderIndex = -1;

  function getDataAtIndex(splitData, index) {
    if (index !== -1 && splitData[index]) {
      return splitData[index];
    }
    return "";
  }

  function getCharacteristics(splitData) {
    return getDataAtIndex(splitData, characteristicsHeaderIndex);
  }
  function getLightSideIcons(splitData) {
    return getDataAtIndex(splitData, lightSideIconsHeaderIndex);
  }
  function getDarkSideIcons(splitData) {
    return getDataAtIndex(splitData, darkSideIconsHeaderIndex);
  }
  function getUniqueness(splitData) {
    return getDataAtIndex(splitData, uniquenessHeaderIndex);
  }
  function getCardName(splitData) {
    return getDataAtIndex(splitData, nameHeaderIndex);
  }
  function getPulls(splitData) {
    return getDataAtIndex(splitData, pullsHeaderIndex);
  }
  function getPulledBy(splitData) {
    return getDataAtIndex(splitData, isPulledHeaderIndex);
  }
  function getCounterpart(splitData) {
    return getDataAtIndex(splitData, counterpartHeaderIndex);
  }
  function getCombo(splitData) {
    return getDataAtIndex(splitData, comboHeaderIndex);
  }
  function getMatching(splitData) {
    return getDataAtIndex(splitData, matchingHeaderIndex);
  }
  function getMatchingWeapon(splitData) {
    return getDataAtIndex(splitData, matchingWeaponHeaderIndex);
  }
  function getCanceledBy(splitData) {
    return getDataAtIndex(splitData, isCanceledByHeaderIndex);
  }
  function getCancels(splitData) {
    return getDataAtIndex(splitData, cancelsHeaderIndex);
  }
  function getAbbreviations(splitData) {
    return getDataAtIndex(splitData, abreviationHeaderIndex);
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
    uniquenessHeaderIndex = headers.indexOf("Uniqueness");
    lightSideIconsHeaderIndex = headers.indexOf("LightSideIcons");
    darkSideIconsHeaderIndex = headers.indexOf("DarkSideIcons");
    characteristicsHeaderIndex = headers.indexOf("Characteristics");
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
        existingCard.characteristics = getCharacteristics(cardDataFields);
        existingCard.lightSideIcons = getLightSideIcons(cardDataFields);
        existingCard.darkSideIcons = getDarkSideIcons(cardDataFields);
        existingCard.uniqueness = getUniqueness(cardDataFields);
      }

    }

    return cards;
  }
  this.addSwipDataFromSwipDump = addSwipDataFromSwipDump;

  function fixNewlines(line) {
    while (line.indexOf("\\par") !== -1) {
      line = line.replace("\\par", "<br>");
    }

    while (line.indexOf("\\b0") !== -1) {
      line = line.replace("\\b0", "<br>");
    }

    while (line.indexOf("\\b") !== -1) {
      line = line.replace("\\b", "<br>");
    }
    line = line.trim();
    return line;
  }

}]);
