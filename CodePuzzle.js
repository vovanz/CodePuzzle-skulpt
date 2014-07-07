CodePuzzle = {
    init: function (data) {
        CodePuzzle.data = data;
        CodePuzzle.change_step();
        $('#help_me').bind('click', function() {
            CodePuzzle.help_me();
        });
    },
    change_step: function () {
        var hash = window.location.hash.split('/');
        var step = parseInt(hash[1], 10) - 1;
        if (hash[0] == '#step' && CodePuzzle.data.levels[step]) {
            CodePuzzle.step = step;
            CodePuzzle.start();
        } else {
            window.location.hash = '#step/1';
        }
    },
    start: function () {
        CodePuzzle.hide_help_me();
        CodePuzzle.tries = 0;
        CodePuzzle.tries_timeout = new Date().getTime();
        $('html, body').animate({
                scrollTop: 0
            }, 500
        );
        var i, j;
        var level = CodePuzzle.data.levels[CodePuzzle.step];
        var lines = level.lines.slice();
        CodePuzzle.correct_order = {};
        for(i = 0; i < lines.length; i++) {
            CodePuzzle.correct_order[lines[i].replace(/\n+/g, '')] = i
        }
        var prog = lines.join('');
        prog = prog.replace(/\n+/g, "\n");
        prog = prog.replace(/^\n+/g, "");
        $('#correct').html('');
        Sk.configure({
            output: function (text) {
                $('#correct').append(text);
            },
            read: builtinRead
        });
        try {
            eval(Sk.importMainWithBody("<stdin>", false, prog));
        }
        catch (e) {
            console.log(e.toString());
            console.log(prog);
        }
        lines = shuffle(lines);
        var puzzle = $('ul#code_puzzle');
        puzzle.html('');
        for (i = 0; i < lines.length; i++) {
            var line = $('<li></li>');
            var locs = hljs.highlight('python', lines[i]).value.split("\n");
            for (j = 0; j < locs.length; j++) if (locs[j] != "") {
                var code = $('<code></code>').html(locs[j]);
                var pre = $('<pre></pre>');
                pre.addClass('hljs');
                pre.addClass('python');
                $('<div></div>').addClass('line-number').appendTo(pre);
                code.appendTo(pre);
                pre.appendTo(line);
            }
            line.appendTo(puzzle);
        }
        puzzle.sortable({
            deactivate: CodePuzzle.run,
            change: CodePuzzle.enumerate
        });
        puzzle.attr('unselectable', 'on')
            .css({
                '-moz-user-select': 'none',
                '-o-user-select': 'none',
                '-khtml-user-select': 'none',
                '-webkit-user-select': 'none',
                '-ms-user-select': 'none',
                'user-select': 'none'
            }).bind('selectstart', function () {
                return false;
            });
        var h1 = $('h1');
        h1.html('Level' + (CodePuzzle.step + 1).toString() + ": " + level.title);
        var title = $('title');
        title.html('CodePuzzle. ' + h1.html());
        CodePuzzle.run();
    },
    enumerate: function () {
        var i = 1;
        $('ul#code_puzzle').find('.line-number').each(function () {
            $(this).html(i.toString() + '.');
            i++;
        });
    },
    run: function () {
        CodePuzzle.enumerate();
        CodePuzzle.tries++;
        var now = new Date().getTime();
        if (
            now - CodePuzzle.tries_timeout >= CodePuzzle.data.settings.tries_timeout &&
            CodePuzzle.tries >= CodePuzzle.data.settings.tries
            )
        {
            CodePuzzle.show_help_me();
        }
        var lines = $('ul#code_puzzle code');
        var prog = '';
        lines.each(function () {
            prog += "\n" + $(this).text().toString();
        });
        prog = prog.replace(/\n+/g, "\n");
        prog = prog.replace(/^\n+/g, "");
        $('#your').html('');
        Sk.configure({
            output: function (text) {
                $('#your').append(text);
            },
            read: builtinRead
        });
        try {
            eval(Sk.importMainWithBody("<stdin>", false, prog));
            CodePuzzle.result();
        }
        catch (e) {
            $('#your').append(e.toString());
            CodePuzzle.error(e.toString());
        }
    },
    error: function (text) {
        $('#result').html('Error! ' + text);
    },
    result: function () {
        if ($('#your').text() != $('#correct').text()) {
            $('#result').html('Wrong answer!');
        } else {
            CodePuzzle.hide_help_me();
            if (CodePuzzle.data.levels[CodePuzzle.step + 1]) {
                ga('send', 'Win', 'level complete', $('h1').text());
                $('#result').html('Level complete! <a href="#step/' + (CodePuzzle.step + 2).toString() + '">Go to next level.</a>');
            } else {
                ga('send', 'Win', 'win game', $('h1').text());
                var share_html = $('#share').html();
                $('#result').html('Congratulations! You won this game! Tell your friends! ' + share_html);
            }
            $('html, body').animate({
                    scrollTop: $(document).height() - $(window).height()},
                500
            );
        }
    },
    show_help_me: function () {
        $('#help_me_wrap').animate({'height': '26px'})
    },
    hide_help_me: function () {
        $('#help_me_wrap').animate({'height': '0px'})
    },
    help_me: function() {
        var helped = false;
        var puzzle = $('ul#code_puzzle li ');
        var i;
        for(i = 1; i < puzzle.length && !helped; i++) {
            var cur = $(puzzle[i]);
            var prev = $(puzzle[i-1]);
            if (prev) {
                if (CodePuzzle.correct_order[prev.find('code').last().text()] + 1 ==
                    CodePuzzle.correct_order[cur.find('code').first().text()]) {
                    helped = true;
                    prev.animate({
                        'margin-bottom': '0px'
                    }, {
                        duration: 100,
                        complete: function () {
                            prev.children().prependTo(cur);
                            prev.remove();
                            CodePuzzle.help_me();
                        }
                    });
                }
            }
        }
    }
};
