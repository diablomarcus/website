describe('PathfinderSpellbookCtrl', function () {

    var scope,
        pathfinderService;


    beforeEach(function () {
        module('katerbergApp');
    });

    describe('Start up', function () {
        var controller,
            $q;
        
        beforeEach(inject(function($controller, $rootScope, _$q_, _pathfinderService_) {
            pathfinderService = _pathfinderService_;
            controller = $controller;
            $q = _$q_;
            scope = $rootScope.$new();
        }));

        it('should populate spells', function () {
            var expected = 'a thing';
            deferredSpells = $q.defer();
            spyOn(pathfinderService, 'getSpellbook').and.returnValue(deferredSpells.promise);

            controller('PathfinderSpellbookCtrl', {$scope: scope});
            scope.$digest();

            expect(scope.spellbook).toBeUndefined();

            deferredSpells.resolve(expected);
            scope.$apply();

            expect(scope.spellbook).toBe(expected);
        });
    });

    describe('After start up', function () {

        beforeEach(inject(function($controller, $rootScope, _pathfinderService_) {
            pathfinderService = _pathfinderService_;
            spyOn(pathfinderService, 'getSpellbook').and.returnValue({then: function(){}});

            scope = $rootScope.$new();
            $controller('PathfinderSpellbookCtrl', {$scope: scope});
            scope.$digest();

        }));

        it('should be defined', function () {
            expect(scope).toBeDefined();
        });

        it('should expose casterTypes', function () {
            expect(scope.casterTypes).toBe(pathfinderService.casterTypes);
        });

        describe('search', function() {
            it('should not allow null settings for level in search', function() {
                scope.search = {};

                scope.search.level = null;
                scope.$apply();

                expect(scope.search.level).toBeUndefined();
            });

            it('should not change level if it is not null', function() {
                scope.search = {};
                var expected = 'something else';

                scope.search.level = expected;
                scope.$apply();

                expect(scope.search.level).toBe(expected);
            });
        });
    });
});
