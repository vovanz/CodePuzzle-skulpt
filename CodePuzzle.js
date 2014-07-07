CodePuzzle = {
    init: function (data) {
        CodePuzzle.data = data;
        CodePuzzle.change_step();
    },
    change_step: function () {
        var hash = window.location.hash.split('/');
        var step = parseInt(hash[1], 10) - 1;
        if (hash[0] == '#step' && CodePuzzle.data[step]) {
            CodePuzzle.step = step;
            CodePuzzle.start();
        } else {
            window.location.hash = '#step/1';
        }
    },
    start: function () {
        $('html, body').animate({
                scrollTop: 0
            }, 500
        );
        var i;
        var level = CodePuzzle.data[CodePuzzle.step];
        var lines = level.lines.slice();

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
        if(typeof level.easiness == "number" && level.easiness > 1) {
            var new_lines = [];
            var new_line = '';
            for(i = 0; i < lines.length; i++) {
                new_line+=lines[i];
                if(new_line != '' && (i+1)%level.easiness == 0) {
                    new_lines.push(new_line);
                    new_line = '';
                }
            }
            if(new_line != '') {
                new_lines.push(new_line);
                new_line = '';
            }
            lines = new_lines;
            $('#comment').html('Reorder blocks to get correct output.');
        } else {
            $('#comment').html('Reorder lines to get correct output.');
        }
        lines = shuffle(lines);
        var puzzle = $('ul#code_puzzle');
        puzzle.html('');
        for (i=0; i < lines.length; i++) {
            var code = $('<code></code>').html(lines[i]);
            var pre = $('<pre></pre>');
            var line = $('<li></li>');
            code.appendTo(pre);
            pre.each(function (i, e) {
                hljs.highlightBlock(e)
            });

            pre.appendTo(line);
            line.appendTo(puzzle);
        }
        puzzle.sortable({
            deactivate: CodePuzzle.run
        });
        var h1 = $('h1');
        h1.html('Level'+(CodePuzzle.step+1).toString()+": "+level.title);
        var title = $('title');
        title.html('CodePuzzle. '+h1.html());
        CodePuzzle.run();
    },
    run: function() {
        var lines = $('ul#code_puzzle code');
        var prog = '';
        lines.each(function() {
           prog += "\n"+$(this).text().toString();
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
    error: function(text) {
        $('#result').html('Error! '+text);
    },
    result: function() {
        if($('#your').text() != $('#correct').text()) {
            $('#result').html('Wrong answer!');
        } else {
            if(CodePuzzle.data[CodePuzzle.step+1]) {
                ga('send', 'Win', 'level complete', $('h1').text());
                $('#result').html('Level complete! <a href="#step/'+(CodePuzzle.step+2).toString()+'">Go to next level.</a>');
            } else {
                ga('send', 'Win', 'win game', $('h1').text());
                var share_html = $('#share').html();
                $('#result').html('Congratulations! You won this game! Tell your friends! '+share_html);
            }
            $('html, body').animate({
                    scrollTop: $(document).height()-$(window).height()},
                500
            );
        }
    }
};