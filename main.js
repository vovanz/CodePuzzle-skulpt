$(function() {
    $.getJson('data.json', {
        success : function(data) {
            if(typeof data[window.location.hash] == "undefined") {
                window.location = "#step1";
            }
        }
    })
});