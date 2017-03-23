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
                    { name: 'gametext' },
                    { name: 'power' },
                    { name: 'forfeit' },
                    { name: 'ability' },
                    { name: 'lore' },
                    { name: 'destiny' },
                    { name: 'title' },
                    { name: 'type' },
                    { name: 'subType' }
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
