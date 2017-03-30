'use strict';
var cardSearchApp = angular.module('cardSearchApp', ['ui.bootstrap', 'ui.bootstrap.tabs', 'queryBuilder']).config(function($locationProvider) { $locationProvider.html5Mode({enabled: true, requireBase: false}); });

cardSearchApp.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
      console.log('trusting: ' + text);
        return $sce.trustAsHtml(text);
    };
}]);
