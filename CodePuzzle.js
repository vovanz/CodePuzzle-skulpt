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
        var task = $('#task');
        task.html(level.task);
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
                $('#result').html('Level complete! <a href="#step/'+(CodePuzzle.step+2).toString()+'">Go to next level.</a>');
            } else {
                $('#result').html('Congratulations! You won this game!');
            }
            $('html, body').animate({
                    scrollTop: $(document).height()-$(window).height()},
                500
            );
        }
    }
};