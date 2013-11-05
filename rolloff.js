var rollOffApp = angular.module('rollOffApp', ['ui']).
    service('$game', Game).
    service('$ui', UI);

function UI() {}

UI.prototype = {
    hideFooterHeader: function() {
        $('#header').hide();
        $('#footer').hide();
    },
    scrollToElement: function(elem, speed) {
        $("html, body").stop(true).animate({ scrollTop: elem.offset().top }, speed || "slow");
    },
}

function GameCtrl($scope, $game, $ui) {

    $scope['$game'] = $game;

    $scope.getPlayers = function() {
        return $game.players;
    }

    $scope.getRounds = function() {
        return new Array($game.getRound() + 1);
    }

    $scope.displayScore = function(score) {
        switch(score) {
            case 10: return 'X';
            case 0: return '-';
            default: return score;
        }
    }

    $scope.getHighlightState = function(player) {
        if (! $game.hasGameStarted()) return "";
        if (player.getRank() == 1) {
            return "success";
        } else if (player.getRank() > 1) {
            return "danger";
        } else if (! $game.isOver() && $game.getCurrentPlayer().getId() == player.getId()) {
            return "active";
        } else {
            return "";
        }
    }
}

function InputCtrl($scope, $game, $ui) {

    $scope['$game'] = $game;
    $scope.notificationText = '';

    $scope.addPlayer = function() {
        var name = $scope.playerName;
        if (name != undefined && name != '') { // TOOD: add proper validation via 'required'
            var player = new Player(name);
            $game.addPlayer(player);
            $scope.playerName = '';
            $ui.scrollToElement($('#formInput'));
        }
    }

    $scope.startGame = function() {
        if ($game.players.length > 1) {      
            $game.start();
            // $ui.addRoundHeader($game.round);
            var player = $game.getCurrentPlayer();
            $scope.notificationText = "Add score for " + player.getName();
            $ui.hideFooterHeader();
            $ui.scrollToElement($('table'));
            $('#wrap').css('padding', 5);
        } 
    }

    $scope.canStartGame = function() {
        return $game.hasEnoughPlayers() && ! $game.isOver();
    }

    $scope.addScore = function(score) {
        if (score == 'X') score = 10;
        if (score != undefined && score >= 0 && score <= 10) {
            var player = $game.getCurrentPlayer();
            var losers = $game.addScore(player, score);
            $ui.scrollToElement($('tr[data-player="' + player.getId() + '"]'), "fast");

            if($game.isOver()) {
                $scope.notificationText = $game.getWinner().getName() + " is the Winner!";
            } else {
                player = $game.getCurrentPlayer();
                $scope.notificationText = "Add score for " + player.getName();
            }
        }
    }

    $scope.restartGame = function() {
        $scope.startGame();
    }

    $scope.undoLast = function() {
        var player = $game.undoLast();
        if (player) $scope.notificationText = "Add score for " + player.getName();
    }

}

$(document).ready(function() {
    Game.game = angular.element(document).injector().get('$game');
});