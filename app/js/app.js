(function() {
'use strict';

var katerbergApp = angular.module('katerbergApp', [
    'ngRoute',
    // 'ui.bootstrap',
    // 'angular-capitalize-filter'
]);

katerbergApp.config(function($routeProvider, $httpProvider) {
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
});
})();
