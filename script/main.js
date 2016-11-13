function createTable(tableData) {
    var table = document.createElement('table');
    var tableBody = document.createElement('tbody');

    tableData.forEach(function (rowData) {
        var row = document.createElement('tr');
        row.setAttribute("data-row", tableData.indexOf(rowData));

        rowData.forEach(function (cellData) {
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            cell.setAttribute("data-cell", rowData.indexOf(cellData));
            cell.setAttribute("data-row", tableData.indexOf(rowData));
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });

    table.appendChild(tableBody);
    document.body.appendChild(table);
    table.setAttribute("id", "table");
    table.setAttribute("class", "table table-bordered");
}

var n = 3;
var nowplayer = true;
var canPlace = true;
var board = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]

function place(e, turn) {
    var x = e.currentTarget.getAttribute("data-cell");
    var y = e.currentTarget.getAttribute("data-row");
    console.log(e.currentTarget.getAttribute("data-row") + "," + e.currentTarget.getAttribute("data-cell"));
    if (board[y][x] != "O" && board[y][x] != "X") {
        if (turn) {
            e.currentTarget.innerHTML = "O";
            board[y][x] = "O";
        } else {
            e.currentTarget.innerHTML = "X";
            board[y][x] = "X";
        }
        nowplayer = !nowplayer;
        canPlace = false;
    }

}

createTable(board);
$("#body").append($(".table"));
$("#body").append($("button"));

$(document).ready(function () {
    $("td").click(function (e) {
        if (canPlace) {
            place(e, nowplayer);
            send(board);
        }
        //        computerPlace();
        var whowon = false;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (checkWin(board, "O", i, j) == 1) {
                    log("circle won");
                    canPlace = false;
                    whowon = true;
                }
                if (checkWin(board, "X", i, j) == 1) {
                    log("cross won");
                    canPlace = false;
                    whowon = true;
                }
            }
        }
        var a;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if(board[i][j] == "O" || board[i][j] == "X") a++;
            }
        }
        if(a>=9 && whowon == false) {
            log("game tied");
            canPlace = false;
        }
    });
    $("#clear").click(function () {
        board = [
                ["1", "2", "3"],
                ["4", "5", "6"],
                ["7", "8", "9"]
            ]
            //        $("#table").remove();
            //        createTable(board);
            //        $("td").click(function (e) {
            //            place(e, nowplayer);
            //            send(board);
            //            //        computerPlace();
            //            if (checkWin(board, "O", e.currentTarget.getAttribute("data-cell"), e.currentTarget.getAttribute("data-row")) == 1) console.log("circle won");
            //            if (checkWin(board, "X", e.currentTarget.getAttribute("data-cell"), e.currentTarget.getAttribute("data-row")) == 1) console.log("cross won");
            //        });
        var arr = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        log("cleared.");
        arr.forEach(function (o, n) {
            board[parseInt(n / 3)][n % 3] = o;
            var selector = "[data-row='" + parseInt(n / 3) + "']" + "[data-cell='" + n % 3 + "']"
            $(selector).text(o)
        });
        send(board);
        canPlace = true;
        nowplayer = true;
    });
});

function computerPlace() {

}

function caseOfWin(brd, x, y) {
    var blank = getBlank();
    var count = 0;
    while (blank) {

    }
}

function getBlank(brd) {
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (brd[i][j] == "") return [i, j];
        }
    }
    return false;
}

function checkWin(brd, player, x, y) {
    for (var i = 0; i < n; i++) {
        if (brd[x][i] != player)
            break;
        if (i == n - 1) {
            return 1;
        }
    }

    //check row
    for (var i = 0; i < n; i++) {
        if (board[i][y] != player)
            break;
        if (i == n - 1) {
            return 1;
        }
    }

    //check diag
    if (x == y) {
        //we're on a diagonal
        for (var i = 0; i < n; i++) {
            if (board[i][i] != player)
                break;
            if (i == n - 1) {
                return 1;
                //report win for s
            }
        }
    }

    //check anti diag (thanks rampion)
    if (x + y == n - 1) {
        for (var i = 0; i < n; i++) {
            if (board[i][(n - 1) - i] != player)
                break;
            if (i == n - 1) {
                return 1;
                //report win for s
            }
        }
    }
    return 0;
}

var Server;

function log(text) {
    $log = $('#log');
    //Add text to log
    $log.append(($log.val() ? "\n" : '') + text);
    //Autoscroll
    $log[0].scrollTop = $log[0].scrollHeight - $log[0].clientHeight;
}

function send(text) {
    Server.send('message', text);
}

$(document).ready(function () {
    log('Connecting...');
    Server = new FancyWebSocket('ws://access.wonny.me:9300/');

    $('#message').keypress(function (e) {
        if (e.keyCode == 13 && this.value) {
            log('You: ' + this.value);
            send(board);

            $(this).val('');
        }
    });

    //Let the user know we're connected
    Server.bind('open', function () {
        log("Connected.");
    });

    //OH NOES! Disconnection occurred.
    Server.bind('close', function (data) {
        log("Disconnected.");
    });

    //Log any messages sent from server
    Server.bind('message', function (payload) {
        console.log(payload);
        if (payload.indexOf("!") == 0) {
            payload = payload.substr(1);
            var arr = payload.split(",")
            log("Placed.");
            arr.forEach(function (o, n) {
                board[parseInt(n / 3)][n % 3] = o;
                var selector = "[data-row='" + parseInt(n / 3) + "']" + "[data-cell='" + n % 3 + "']"
                $(selector).text(o)
            });
            nowplayer = !nowplayer;
            canPlace = true;
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    if (checkWin(board, "O", i, j) == 1) {
                        log("circle won");
                        canPlace = false;
                    }
                    if (checkWin(board, "X", i, j) == 1) {
                        log("cross won");
                        canPlace = false;
                    }
                }
            }
        } else log(payload);
        if (payload == "1,2,3,4,5,6,7,8,9") nowplayer = true;
    });

    Server.connect();
});