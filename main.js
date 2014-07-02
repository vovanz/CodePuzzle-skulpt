$(function() {
    $.getJSON('data.json',  function(data) {
            if(typeof data[window.location.hash] == "undefined") {
                window.location = "#step1";
            }

    });
});