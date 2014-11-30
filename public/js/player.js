$( document ).ready(function() {
    var video = document.getElementById("video");
    $("video").on("click", function(){
        video.paused ? video.play() : video.pause();
    });
    document.onkeypress = function(e){
        if((e || window.event).keyCode === 32){
            video.paused ? video.play() : video.pause();
        }
    };
});
