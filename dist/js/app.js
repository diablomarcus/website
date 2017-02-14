(function() {
'use strict';

var katerbergApp = angular.module('katerbergApp', [
    'ngRoute',
    // 'ui.bootstrap',
    // 'angular-capitalize-filter'
]);

katerbergApp.config(["$routeProvider", "$httpProvider", function($routeProvider, $httpProvider) {
    $httpProvider.defaults.cache = true;

    $routeProvider.
    when('/', {
        templateUrl: 'partials/about-me.html'
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

(function() {
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

(function() {
    'use strict';

    angular.module('katerbergApp').controller('SidebarCtrl', ["$scope", "$location", function($scope, $location) {
        function go(path) {
            $location.path(path);
        }
        $scope.go = go;
    }]);
})();

(function() {
    'use strict';

    angular.module('katerbergApp').controller('WebDevCtrl', ["$scope", "$location", function($scope, $location) {
        function goSpellbook() {
            $location.path('pathfinder-spellbook');
        }

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

(function() {
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


(function() {
    'use strict';

    angular.module('katerbergApp')
    .controller('PathfinderSpellbookCtrl', ["$scope", "pathfinderService", "modalService", function($scope, pathfinderService, modalService) {
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

(function() {
    angular.module('katerbergApp').factory('Spell', function() {
        var Spell;

        Spell = (function() {
            function buildClasses(input) {
                if (!input) {
                    return input;
                }
                return input.split(', ').map(function(levelInput) {
                    var classAndLevel = levelInput.split(' ');
                    classAndLevel[0] = classAndLevel[0].charAt(0).toUpperCase() + classAndLevel[0].substr(1);
                    classAndLevel[0] = classAndLevel[0].replace(/\/(.)/, function(charToReplace) {
                        return charToReplace.toUpperCase();
                    });
                    return {name: classAndLevel[0], level: parseInt(classAndLevel[1])};
                });
            }

            function Spell(args) {
                if (!args) {
                    return;
                }
                this.description = args.description;
                this.school = args.school;
                this.name = args.name;
                this.classes = buildClasses(args.level);
                this.area = args.area;
                this.effect = args.effect;
                this.descriptor = args.descriptor;
                this.range = args.range;
                this.components = args.components;
                this.duration = args.duration;
                this.subSchool = args.subschool;
                this.target = args.target;
                // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                this.savingThrow = args.saving_throw;
                this.spellResistance = args.spell_resistance;
                this.shortDescription = args.short_description;
                this.castingTime = args.casting_time;
                // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            }

            return Spell;
        })();

        return Spell;
    });
})();


(function() {
    'use strict';

    angular.module('katerbergApp').controller('SpellModalCtrl', ["$scope", "$modalInstance", "spell", function($scope, $modalInstance, spell) {
        function close() {
            $modalInstance.close();
        }

        function showDetails(spell) {
            spell.showDetails = true;
        }

        $scope.close = close;
        $scope.spell = spell;
        $scope.showDetails = showDetails;
    }]);
})();

(function() {
    angular.module('katerbergApp').factory('spellService', ["Spell", function(Spell) {
        function spellify(dirtySpell) {
            Object.keys(dirtySpell.fields, function(key, value) {
                dirtySpell.fields[key] = value.replace(/<[^>]*>/gm, '');
            });
            return new Spell(dirtySpell.fields);
        }

        return {
            spellify: spellify
        };
    }]);
})();
