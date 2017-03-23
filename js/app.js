'use strict';
var cardSearchApp = angular.module('cardSearchApp', ['ui.bootstrap', 'ui.bootstrap.tabs', 'queryBuilder']).config(function($locationProvider) { $locationProvider.html5Mode({enabled: true, requireBase: false}); });
