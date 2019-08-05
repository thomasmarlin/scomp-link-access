"use strict";
var cardSearchApp = angular.module('cardSearchApp');
cardSearchApp.service('SWIPExportService', [function() {

  function getUniqueness(name) {
    var str = "";
    var uniqueness = (name.match(/•/g) || []).length;
    for (var i = 0; i < uniqueness; i++) {
      str += "*";
    }
    return str;
  }

  function getTitle(card) {
    var title = card.title;
    title = title.replace(/•/g, "");
    return title;
  }

  function getLightLocationText(card) {
    return getLocationText(card);
  }

  function getDarkLocationText(card) {
    return getLocationText(card);
  }

  function getLocationText(card) {
    if (cardIsType(card, "Site") || cardIsType(card, "System") || cardIsType(card, "Sector")) {
      return card.gametext;
    } else {
      return "";
    }
  }



  function toSeparatedString(separatedString, boldLines) {
    if (!separatedString) {
      return "";
    }

    separatedString = separatedString.replace(/<br\>/g, "\\par");
    separatedString = separatedString.replace(/\\\\par /, "\\par");

    if (boldLines) {
      var boldedStrings = "";
      var lines = separatedString.split("\par");
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (boldedStrings.length !== 0) {
          boldedStrings += " ";
        }
        boldedStrings += "\b " + line + "\b0";
      }
      return boldedStrings;
    }

    return separatedString;

    /*
    if (!arr) {
      return "";
    }

    var str = "";
    for (var i = 0; i < arr.length; i++) {
      var val = arr[i];
      if (str !== "") {
        val += "\par" + val;
      }
    }
    return str;
    */
  }

  function arrayContains(arr, txt) {
    for (var i = 0; i < arr.length; i++) {
      var str = arr[i];
      if (txt.trim() === str.trim()) {
        return 1;
      }
    }
    return "";
  }

  function cardIsType(card, typeString) {
    return card.type === typeString;
  }

  function getCardSet(card) {
    var set = card.set;
    return set.replace(/Virtual Set /g, 'Virtual Card Set #');
  }

  function getVirtualSet(card) {
    if (-1 !== card.set.indexOf("Virtual")) {
      // Parse last 2 characters into an integer... I'm a cheater...
      return parseInt(card.set.substr(card.set.length - 3));
    }
    return "";
  }

  function cardHasModel(card) {
    return cardIsType(card, "Vehicle") || cardIsType(card, "Starship") || (card.subType === "Droid");
  }

  function cardHasForceAptitude(card) {
    return cardIsType(card, "Character") && (card.subType !== "Droid");
  }

  function cardSortFunc(a, b) {
    // Sort by "Type - Subtype", "title", "set"
    if (typeof a.id === 'undefined') {
      a.id = 999999;
    }
    if (typeof b.id === 'undefined') {
      b.id = 999999;
    }

    /*
    if (typeof a.id != "number") {
      console.log("What the crap!" + a.id + " type: " + typeof a.id);
    }
    if (typeof b.id != "number") {
      console.log("What the crap!" + b.id + " type: " + typeof b.id);
    }
    */

    if (a.id < b.id) {
      return -1;
    } else if (a.id > b.id) {
      return 1;
    } else {
      return 0;
    }
  }


  this.exportCards = function(cards) {
    var allLines = "id|CardName|Grouping|CardType|Subtype|ModelType|Expansion|Rarity|Uniqueness|Characteristics|Destiny|Power|Ferocity|CreatureDefenseValue|CreatureDefenseValueName|ObjectiveFront|ObjectiveBack|ObjectiveFrontName|ObjectiveBackName|Deploy|Forfeit|Armor|Ability|Hyperspeed|Landspeed|Politics|Maneuver|ForceAptitude|Lore|Gametext|JediTestNumber|LightSideIcons|DarkSideIcons|LightSideText|DarkSideText|Parsec|Icons|Planet|Space|Mobile|Interior|Exterior|Underground|Creature|Vehicle|Starship|Underwater|Pilot|Warrior|Astromech|PermanentWeapon|SelectiveCreature|Independent|ScompLink|Droid|TradeFederation|Republic|Episode1|Information|Abbreviation|Pulls|IsPulled|Counterpart|Combo|Matching|MatchingWeapon|Rules|Cancels|IsCanceledBy|Inventory|Needs|ExpansionV|Influence|Grabber|Errata|CardNameV|UniquenessV\n";

    // Sort by the card id
    cards = cards.sort(cardSortFunc);

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card.legacy) {
        continue;
      }
      var cardLine = exportCard(card);

      allLines += cardLine + "\n";
    }

    var lines = allLines.split('\n');
    console.log("line: " + lines[0]);
    console.log("line: " + lines[1]);
    console.log("line: " + lines[2]);
    console.log("line: " + lines[3]);
    console.log("line: " + lines[4]);

    return allLines;
  };

  function getRarity(card) {
    switch (card.rarity) {
      case "R":
        return "Rare";
      case "R1":
        return "Rare1";
      case "R2":
        return "Rare2";
      case "XR":
        return "Exclusive Rare";
      case "UR":
        return "Ultra Rare";
      case "U":
        return "Uncommon";
      case "U1":
        return "Uncommon1";
      case "U2":
        return "Uncommon2";
      case "C":
        return "Common";
      case "C1":
        return "Common1";
      case "C2":
        return "Common2";
      case "C3":
        return "Common3";
      case "F":
        return "Fixed";
      case "P":
        return "Premium";
      case "PM":
        return "Premium";
      default:
        console.log("Unknown Rarity: " + card.rarity);
        return card.rarity;
    }
  }


  function exportCard(card) {
    if ((card.id !== 0) && !card.id) {
      console.log("Skipping card: " + card.title + " with id: " + card.id);
      return "";
    }

    var cardLine = "";

    // id|CardName|Grouping|CardType|Subtype|ModelType|Expansion|Rarity|Uniqueness|Characteristics|Destiny|Power|Ferocity|CreatureDefenseValue|CreatureDefenseValueName|
    cardLine += card.id;
    cardLine += '|' + getTitle(card);
    cardLine += '|' + card.side;
    cardLine += '|' + card.type;
    cardLine += '|' + card.subType;
    cardLine += '|' + (cardHasModel(card) ? card.extraText : ""); // ModelType
    cardLine += '|' + getCardSet(card);
    cardLine += '|' + getRarity(card);
    cardLine += '|' + getUniqueness(card.title);
    cardLine += '|' + toSeparatedString(card.characteristics, true);
    cardLine += '|' + card.destiny;
    cardLine += '|' + card.power;
    cardLine += '|' + card.ferocity;
    cardLine += '|' + (cardIsType(card, "Creature") ? card.defenseValue : "");
    cardLine += '|' + (cardIsType(card, "Creature") ? card.extraText : "");

    // |ObjectiveFrontName|ObjectiveBackName|Deploy|Forfeit|Armor|Ability|Hyperspeed|Landspeed|Politics|Maneuver|ForceAptitude|Lore|Gametext
    cardLine += '|' + (cardIsType(card, "Objective") ? card.gametext : ""); // ObjectiveFront
    cardLine += '|' + (cardIsType(card, "Objective") ? card.gametext : ""); // ObjectiveBack
    cardLine += '|' + ""; // ObjectiveFrontName
    cardLine += '|' + ""; // ObjectiveBackName
    cardLine += '|' + card.deploy;
    cardLine += '|' + card.forfeit;
    cardLine += '|' + card.armor;
    cardLine += '|' + card.ability;
    cardLine += '|' + card.hyperspeed;
    cardLine += '|' + card.landspeed;
    cardLine += '|' + card.politics;
    cardLine += '|' + card.maneuver;
    cardLine += '|' + (cardHasForceAptitude(card) ? card.extraText : ""); // ForceAptitude
    cardLine += '|' + card.lore;
    cardLine += '|' + card.gametext;

    // JediTestNumber|LightSideIcons|DarkSideIcons|LightSideText|DarkSideText|Parsec|Icons|Planet|Space|Mobile|Interior|Exterior|Underground|Creature|Vehicle|Starship|Underwater|Pilot|
    cardLine += '|' + ""; // JediTestNumber
    cardLine += '|' + card.lightSideIcons;
    cardLine += '|' + card.darkSideIcons;
    cardLine += '|' + getLightLocationText(card); // LightSideText (locations?)
    cardLine += '|' + getDarkLocationText(card);// DarkSideText (locations?)
    cardLine += '|' + card.parsec;
    cardLine += '|' + toSeparatedString(card.icons);
    cardLine += '|' + arrayContains(card.icons, "Planet");
    cardLine += '|' + arrayContains(card.icons, "Space");
    cardLine += '|' + arrayContains(card.icons, "Mobile");
    cardLine += '|' + arrayContains(card.icons, "Interior");
    cardLine += '|' + arrayContains(card.icons, "Exterior");
    cardLine += '|' + arrayContains(card.icons, "Underground");
    cardLine += '|' + cardIsType(card, "Creature");
    cardLine += '|' + cardIsType(card, "Vehicle");
    cardLine += '|' + cardIsType(card, "Starship");
    cardLine += '|' + arrayContains(card.icons, "Underwater");
    cardLine += '|' + arrayContains(card.icons, "Pilot");

    // Warrior|Astromech|PermanentWeapon|SelectiveCreature|Independent|ScompLink|Droid|TradeFederation|Republic|Episode1|
    cardLine += '|' + arrayContains(card.icons, "Warrior");
    cardLine += '|' + arrayContains(card.icons, "Astromech");
    cardLine += '|' + arrayContains(card.icons, "Permanent Weapon");
    cardLine += '|' + arrayContains(card.icons, "Selective");
    cardLine += '|' + arrayContains(card.icons, "Independent");
    cardLine += '|' + arrayContains(card.icons, "Scomp Link");
    cardLine += '|' + cardIsType(card, "Droid");
    cardLine += '|' + arrayContains(card.icons, "Trade Federation");
    cardLine += '|' + (-1 !== card.subType.indexOf("Republic"));
    cardLine += '|' + arrayContains(card.icons, "Episode 1");

    // Information|Abbreviation|Pulls|IsPulled|Counterpart|Combo|Matching|MatchingWeapon|Rules|Cancels|IsCanceledBy|Inventory|Needs|ExpansionV|Influence|Grabber|Errata|CardNameV|UniquenessV
    cardLine += '|' + card.information;
    cardLine += '|' + toSeparatedString(card.abbreviation);
    cardLine += '|' + toSeparatedString(card.pulls);
    cardLine += '|' + toSeparatedString(card.pulledBy);
    cardLine += '|' + card.counterpart;
    cardLine += '|' + toSeparatedString(card.combo);
    cardLine += '|' + toSeparatedString(card.matching);
    cardLine += '|' + ""; // MatchingWeapons
    cardLine += '|' + toSeparatedString(card.cancels);
    cardLine += '|' + toSeparatedString(card.canceledBy);
    cardLine += '|'; // Inventory
    cardLine += '|'; // Needs
    cardLine += '|' + getVirtualSet(card);
    cardLine += '|' + card.influence;
    cardLine += '|' + arrayContains(card.icons, "Grabber");
    cardLine += '|' + card.errata;
    cardLine += '|' + ""; // CardNameV;
    cardLine += '|' + ""; // UniquenessV;

    return cardLine;
  }

}]);

// id|CardName|Grouping|CardType|Subtype|ModelType|Expansion|Rarity|Uniqueness|Characteristics|Destiny|Power|Ferocity|CreatureDefenseValue|CreatureDefenseValueName|ObjectiveFront|ObjectiveBack|ObjectiveFrontName|ObjectiveBackName|Deploy|Forfeit|Armor|Ability|Hyperspeed|Landspeed|Politics|Maneuver|ForceAptitude|Lore|Gametext|JediTestNumber|LightSideIcons|DarkSideIcons|LightSideText|DarkSideText|Parsec|Icons|Planet|Space|Mobile|Interior|Exterior|Underground|Creature|Vehicle|Starship|Underwater|Pilot|Warrior|Astromech|PermanentWeapon|SelectiveCreature|Independent|ScompLink|Droid|TradeFederation|Republic|Episode1|Information|Abbreviation|Pulls|IsPulled|Counterpart|Combo|Matching|MatchingWeapon|Rules|Cancels|IsCanceledBy|Inventory|Needs|ExpansionV|Influence|Grabber|Errata|CardNameV|UniquenessV
