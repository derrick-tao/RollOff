var rollOffApp = angular.module('rollOffApp', ['ui']).
    service('$game', Game).
    service('$ui', UI);

function UI() {}

UI.prototype = {
    addRoundHeader: function(n) {
        $('table.table thead tr').append('<th>' + (n + 1) + '</th>');
    },
    addPlayer: function(player) {
        $('table.table tbody').append('<tr data-player="' + player.getId() + '"><td>' + player.getName() + '</td></tr>');
    },
    addScore: function(player, score) {
        if (score == 10) score = "X";
        if (score == 0) score = "-";
        $('tbody tr').css('background', 'white');
        $('table.table tr[data-player="'+ player.getId() + '"]').append('<td>' + score + '</td>');
        $('table.table tr[data-player="'+ player.getId() + '"] td:last-child').effect('highlight');
    },
	removeAllScores: function() {
		$('tbody tr td:not(:first-child)').remove();
		$('thead tr th:not(:first-child)').remove();
        $('tbody td:first-child').children().remove();
        $('tbody tr').removeClass('danger success');
	},
    handleLosersUI: function(losers) {
        $.each(losers, function(i, p) {
            $('table.table tr[data-player="'+ p.getId() + '"] td:first-child').append(' <span class="badge">' + p.getRank() + '</span>');
            var cssClass = 'danger';
            if (p.getRank() == 1) {
                cssClass = 'success';
            }
            $('tbody tr[data-player="' + p.getId() + '"]').addClass(cssClass);
        });
    },
    highlightPlayer: function(player) {
        $('tbody tr').removeClass('active');
        $('tbody tr[data-player="' + player.getId() + '"]').addClass('active');
    },
    hideFooterHeader: function() {
        $('#header').hide();
        $('#footer').hide();
    },
    scrollToElement: function(elem, speed) {
        $("html, body").stop(true).animate({ scrollTop: elem.offset().top }, speed || "slow");
    },
}

function InputCtrl($scope, $game, $ui) {

    $scope.notificationText = '';

    $scope.addPlayer = function() {
        var name = $scope.playerName;
        if (name != undefined && name != '') { // TOOD: add proper validation via 'required'
            var player = new Player(name);
            $game.addPlayer(player);
            $scope.playerName = '';
            $ui.addPlayer(player);
            $ui.scrollToElement($('#formInput'));
        }
    }

    $scope.startGame = function() {
        if ($game.players.length > 1) {      
            $game.start();
            $ui.addRoundHeader($game.round);
            var player = $game.getCurrentPlayer();
            $scope.notificationText = "Add score for " + player.getName();
            $ui.highlightPlayer(player);
            $ui.hideFooterHeader();
            $ui.scrollToElement($('table'));
            $('#wrap').css('padding', 5);
        } 
    }

    $scope.canStartGame = function() {
        return $game.hasEnoughPlayers() && ! $game.isOver();
    }

    $scope.isGameOver = function() {
        return $game.isOver();
    }

    $scope.hasGameStarted = function() {
        return $game.hasGameStarted();
    }

    $scope.addScore = function(score) {
        if (score == 'X') score = 10;
        if (score != undefined && score >= 0 && score <= 10) {
            var player = $game.getCurrentPlayer();
            var losers = $game.addScore(player, score);
            $ui.addScore(player, score);
            $ui.scrollToElement($('tr[data-player="' + player.getId() + '"]'), "fast");
            $ui.handleLosersUI(losers);

            if($game.isOver()) {
                $scope.notificationText = $game.getWinner().getName() + " is the Winner!";
            } else {
                player = $game.getCurrentPlayer();
                $ui.highlightPlayer(player);
                $scope.notificationText = "Add score for " + player.getName();
                if($game.isNewRound()) {
                    $ui.addRoundHeader($game.round);
                }
            }
        }
    }

    $scope.restartGame = function() {
        $ui.removeAllScores();
        $scope.startGame();
    }

}

$(document).ready(function() {
    // Game.game = angular.element(document).injector().get('$game');
});