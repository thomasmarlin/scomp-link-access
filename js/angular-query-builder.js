/* jshint ignore:start */
var queryBuilder = angular.module('queryBuilder', []);
queryBuilder.directive('queryBuilder', ['$compile', function ($compile) {
    return {
        restrict: 'E',
        scope: {
            group: '='
        },
        templateUrl: 'queryBuilderDirective.html',
        compile: function (element, attrs) {
            var content, directive;
            content = element.contents().remove();
            return function (scope, element, attrs) {
                scope.operators = [
                    { name: 'AND' },
                    { name: 'OR' }
                ];

                scope.fields = [
                    { name: 'ability' },
                    { name: 'armor' },
                    { name: 'deploy' },
                    { name: 'destiny' },
                    { name: 'forfeit' },
                    { name: 'gametext' },
                    { name: 'hyperspeed' },
                    { name: 'lore' },
                    { name: 'maneuver' },
                    { name: 'power' },
                    { name: 'side' },
                    { name: 'subType' },
                    { name: 'title' },
                    { name: 'type' }
                ];

                scope.conditions = [
                    { name: 'has'},
                    { name: '=' },
                    { name: '<>' },
                    { name: '<' },
                    { name: '<=' },
                    { name: '>' },
                    { name: '>=' }
                ];

                scope.lightDarkOptions = [
                  { name: 'Light', data: 'ls'},
                  { name: 'Dark', data: 'ds'}
                ];

                scope.isTextField = function(fieldName) {
                  return !scope.isNumberField && !scope.isSideField;
                };

                scope.isNumberField = function(fieldName) {
                  switch (fieldName) {
                    case 'ability':
                    case 'armor':
                    case 'deploy':
                    case 'destiny':
                    case 'forfeit':
                    case 'hyperspeed':
                    case 'maneuver':
                    case 'power':
                      return true;
                    default:
                      return false;
                  }
                };

                scope.isSideField = function(fieldName) {
                  return (fieldName == 'side');
                };


                scope.addCondition = function () {
                    scope.group.rules.push({
                        condition: 'has',
                        field: 'gametext',
                        data: ''
                    });
                };

                scope.removeCondition = function (index) {
                    scope.group.rules.splice(index, 1);
                };

                scope.addGroup = function () {
                    scope.group.rules.push({
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
                    });
                };

                scope.removeGroup = function () {
                    "group" in scope.$parent && scope.$parent.group.rules.splice(scope.$parent.$index, 1);
                };

                directive || (directive = $compile(content));

                element.append(directive(scope, function ($compile) {
                    return $compile;
                }));
            }
        }
    }
}]);

/* jshint ignore:end */
