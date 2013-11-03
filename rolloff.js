var rollOffApp = angular.module('rollOffApp', ['ui']).
    service('$game', Game);

var UI = {
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
        $('#notification .panel-body').html("Add score for " + player.getName());
    },
    hideFooterHeader: function() {
        $('#header').hide();
        $('#footer').hide();
    },
    scrollToElement: function(elem, speed) {
        $("html, body").stop(true).animate({ scrollTop: elem.offset().top }, speed || "slow");
    },
}

function AddPlayerCtrl($scope, $game) {
    $scope.addPlayer = function() {
        var name = $scope.playerName;
        if (name != undefined && name != '') { // TOOD: add proper validation via 'required'
            var player = new Player(name);
            $game.addPlayer(player);
            $scope.playerName = '';
            UI.addPlayer(player);
        }
        // if($game.players.length > 1) {
        //     $('#startGame').removeAttr('disabled');
        // }
    }
}

function initializeListenersFor(game) {
    $('#formInput input').focus(function(e) {
        UI.scrollToElement($(this));
    })
    $('#startGame').click(function() { handlers.startGame(game)});
	$('#formAddScore button').click( function() { 
        var score = $(this).html();
        switch(score) {
            case "-": score = 0; break;
            case "X": score = 10; break;
            default: score = parseInt(score);
        }
        handlers.addScore(game, score);
    });
    $('#restartGame').click(function() { handlers.restartGame(game)});
}

var handlers = {
    addPlayer: function(game) {
        var name = $('#formInput input').val();
        if (name != undefined && name != '') {
            var player = new Player(name);
            UI.addPlayer(player);
            game.addPlayer(player);
            $('#formInput input').val('');
        }
        if(game.players.length > 1) {
            $('#startGame').removeAttr('disabled');
        }
    },
    startGame: function(game) {
		if (game.players.length > 1) {		
			game.start();
			UI.addRoundHeader(game.round);
            var player = game.getCurrentPlayer();
			$('#formInput').hide();
			$('#startGame').hide();
			$('#formAddScore').show();
            $('#notification').show();
            UI.highlightPlayer(player);
            UI.hideFooterHeader();
            $('#wrap').css('padding', 5);
            UI.scrollToElement($('table'));
		}
    },
	restartGame: function(game) {
        $('#restartGame').hide();
		UI.removeAllScores();
        handlers.startGame(game);
	},
	addScore: function(game, score) {
        if (score != undefined && score >= 0 && score <= 10) {
            var player = game.getCurrentPlayer();
			var losers = game.addScore(player, score);
			UI.addScore(player, score);
            UI.scrollToElement($('tr[data-player="' + player.getId() + '"]'), "fast");
            UI.handleLosersUI(losers);

			if(game.isOver()) {
				$('#formAddScore').hide();
				$('#restartGame').show();
                $('#notification .panel-body').html(game.restartedPlayerOrder[0].getName() + " is the Winner!").effect('highlight');
			} else {
                player = game.getCurrentPlayer();
                UI.highlightPlayer(player);
                if(game.cur == 0) {
                    UI.addRoundHeader(game.round);
                }
            }
        }
	}
}

$(document).ready(function() {
    // Game.game = new Game();
    // initializeListenersFor(Game.game);
    document.game = angular.element(document).injector().get('$game');
});