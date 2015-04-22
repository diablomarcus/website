(function () {
'use strict';

    var katerbergApp = angular.module('katerbergApp', [
        'ngRoute',
        'ui.bootstrap'
    ]);

    katerbergApp.config(["$routeProvider", "$httpProvider", function($routeProvider, $httpProvider) {
        $httpProvider.defaults.cache = true;

        $routeProvider.
          when('/', {
            templateUrl: 'partials/home.html'
          }).
          when('/about-me', {
            templateUrl: 'partials/about-me.html'
          }).
          when('/minesweeper', {
            templateUrl: 'partials/minesweeper.html',
            controller: 'MinesweeperCtrl'
          }).
          when('/pathfinder-spellbook', {
            templateUrl: 'partials/pathfinder-spellbook.html',
            controller: 'PathfinderSpellbookCtrl'
          }).
          when('/web-dev', {
            templateUrl: 'partials/web-dev.html',
            controller: 'WebDevCtrl'
          }).
          when('/mtg', {
            templateUrl: 'partials/mtg.html'
          }).
          when('/board-games', {
            templateUrl: 'partials/board-games.html'
          }).
          when('/linux', {
            templateUrl: 'partials/linux.html'
          }).
          otherwise({
            redirectTo: '/'
          });
      }]);
})();

(function () {
    angular.module('katerbergApp').factory('modalService', ["$modal", function($modal) {
        return {
            open: $modal.open,
            spell: {
                url: 'partials/modals/spellbook-detail.html',
                controller: 'SpellModalCtrl'
            }
        };
    }]);
})();



(function () {
    'use strict';

    angular.module('katerbergApp').controller('SidebarCtrl', ["$scope", "$location", function($scope, $location) {
        function go(path) {
            $location.path(path);
        }
        $scope.go = go;
    }]);
})();

(function () {
    'use strict';

    angular.module('katerbergApp').controller('WebDevCtrl', ["$scope", "$location", function($scope, $location) {
        function goMinesweeper() {
            $location.path('minesweeper');
        }

        function goSpellbook() {
            $location.path('pathfinder-spellbook');
        }


        $scope.goMinesweeper = goMinesweeper;
        $scope.goSpellbook = goSpellbook;
    }]);
})();

(function() {
    'use strict';

    angular.module('katerbergApp').controller('MinesweeperCtrl', ["$scope", "minesweeperService", function($scope, minesweeperService) {
        function resetBoard(gridSize) {
            $scope.rows = [];
            $scope.numberOfFlags = 0;
            for (var i = 0; i < gridSize; i++) {
                $scope.rows.add({
                    'cells': []
                });
                for (var j = 0; j < gridSize; j++) {
                    var cell = minesweeperService.createNewCell();
                    cell.rowNumber = i;
                    cell.columnNumber = j;
                    if (cell.bomb) {
                        $scope.numberOfFlags++;
                    }

                    $scope.rows[i].cells.add(cell);
                }
            }
        }

        function getNumberOfUnclearedCells() {
            var unclearedCells = 0;
            $scope.rows.forEach(function(row) {
                row.cells.forEach(function(cell) {
                    if (!cell.selected) {
                        unclearedCells++;
                    }
                });
            });
            return unclearedCells;
        }

        function calculateBombsNearby(cell) {
            var bombs = 0;
            var isLeft = cell.columnNumber === 0;
            var isRight = cell.columnNumber === $scope.rows[0].cells.length - 1;
            var isBottom = cell.rowNumber === $scope.rows.length - 1;
            var isTop = cell.rowNumber === 0;
            if (!isTop) {
                if ($scope.rows[cell.rowNumber - 1].cells[cell.columnNumber].bomb) {
                    bombs++;
                }
                if (!isLeft) {
                    if ($scope.rows[cell.rowNumber - 1].cells[cell.columnNumber - 1].bomb) {
                        bombs++;
                    }
                }
                if (!isRight) {
                    if ($scope.rows[cell.rowNumber - 1].cells[cell.columnNumber + 1].bomb) {
                        bombs++;
                    }
                }
            }
            if (!isBottom) {
                if ($scope.rows[cell.rowNumber + 1].cells[cell.columnNumber].bomb) {
                    bombs++;
                }
                if (!isLeft) {
                    if ($scope.rows[cell.rowNumber + 1].cells[cell.columnNumber - 1].bomb) {
                        bombs++;
                    }
                }
                if (!isRight) {
                    if ($scope.rows[cell.rowNumber + 1].cells[cell.columnNumber + 1].bomb) {
                        bombs++;
                    }
                }
            }

            if (!isLeft) {
                if ($scope.rows[cell.rowNumber].cells[cell.columnNumber - 1].bomb) {
                    bombs++;
                }
            }
            if (!isRight) {
                if ($scope.rows[cell.rowNumber].cells[cell.columnNumber + 1].bomb) {
                    bombs++;
                }
            }
            return bombs;
        }

        function resetGame() {
            $scope.hasWon = false;
            $scope.hasLost = false;
            $scope.resetBoard(15);
        }

        function selectCell(cell) {
            if ($scope.hasWon || $scope.hasLost) {
                return;
            }
            cell.selected = true;
            cell.bombsNearby = calculateBombsNearby(cell);
            $scope.hasLost = minesweeperService.checkForLoss(cell);
            $scope.hasWon = minesweeperService.checkForWin($scope.rows);
            if ($scope.hasWon) {
                alert('You win!');
            }
        }

        $scope.selectCell = selectCell;
        $scope.resetGame = resetGame;
        $scope.getNumberOfUnclearedCells = getNumberOfUnclearedCells;
        $scope.resetBoard = resetBoard;
        resetGame();
    }]);
})();

(function() {
    angular.module('katerbergApp').factory('minesweeperService', function() {

        function createNewCell() {
            var newCell = {
                'selected': false
            };
            if (Math.random() < 0.2) {
                newCell.bomb = true;
            }
            return newCell;
        }

        function checkForLoss(cell) {
            return cell.bomb;
        }

        function checkForWin(board) {
            return board.every(function(row) {
                return row.cells.every(function(cell) {
                    if (!cell.selected && !cell.bomb) {
                        return false;
                    }
                    return true;
                });
            });
        }

        return {
            createNewCell: createNewCell,
            checkForLoss: checkForLoss,
            checkForWin: checkForWin
        };
    });
})();

(function () {
    angular.module('katerbergApp').factory('pathfinderService', ["$http", "$q", "spellService", function($http, $q, spellService) {
        function getSpellbook() {
            return $http.get('static/spells.json').then(function(res) {
                return res.data.map(function(dirtySpell) {
                    return spellService.spellify(dirtySpell);
                });
            });

        }
        var casterTypes = ['Bard',
            'Cleric',
            'Druid',
            'Paladin',
            'Ranger',
            'Sorcerer/Wizard'];

        return {
            getSpellbook: getSpellbook,
            casterTypes: casterTypes
        };
    }]);
})();


(function () {
    'use strict';

    angular.module('katerbergApp').controller('PathfinderSpellbookCtrl', ["$scope", "pathfinderService", "modalService", function($scope, pathfinderService, modalService) {
        pathfinderService.getSpellbook().then(function(data) {
            $scope.spellbook = data;
        });

        $scope.casterTypes = pathfinderService.casterTypes;
        $scope.$watch('search.level', function(item) {
            if (item === null) {
                $scope.search.level = undefined;
            }
        });

        function drillIntoSpell(spell) {
            modalService.open({
                templateUrl: modalService.spell.url,
                controller: modalService.spell.controller,
                resolve: {spell: function() {
                    return spell;
                }}
            });
        }

        $scope.drillIntoSpell = drillIntoSpell;
    }]);
})();

(function () {
    angular.module('katerbergApp').factory('Spell', function() {
        var Spell;

        Spell = (function() {

            function Spell(args) {
                if (!args) {
                    return;
                }
                this.description = args.description;
                this.school = args.school;
                this.savingThrow = args.saving_throw;
                this.name = args.name;
                this.level = args.level;
                this.spellResistance = args.spell_resistance;
                this.area = args.area;
                this.castingTime = args.casting_time;
                this.effect = args.effect;
                this.descriptor = args.descriptor;
                this.range = args.range;
                this.shortDescription = args.short_description;
                this.components = args.components;
                this.duration = args.duration;
                this.subSchool = args.subschool;
                this.target = args.target;
            }

            return Spell;
        })();

        return Spell;
    });
})();


(function () {
    'use strict';

    angular.module('katerbergApp').controller('SpellModalCtrl', ["$scope", "$modalInstance", "spell", function($scope, $modalInstance, spell) {
        function close() {
            $modalInstance.close();
        }

        $scope.close = close;
        $scope.spell = spell;
    }]);
})();

(function () {
    angular.module('katerbergApp').factory('spellService', function() {
        function spellify(dirtySpell) {
            Object.keys(dirtySpell.fields, function(key, value) {
                dirtySpell.fields[key] = value.replace(/<[^>]*>/gm, '');
            });
            return dirtySpell.fields;
        }

        return {
            spellify: spellify
        };
    });
})();
