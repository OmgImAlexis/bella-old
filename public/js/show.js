$('td div[role="progressbar"]').each(function(){
    var show = $(this).parent().parent().data('show');
    var progress = ((show.downloadsDone + show.downloadsPending) / show.episodes) * 100;
    $(this).progressbar({
      value: progress
    });
    $(this).append("<div class='progressbarText' title='Downloaded: " + show.downloadsDone + " Snatched: " + show.downloadsPending + " Total: " + show.episodes + "'>" + show.downloadsDone + " + " + show.downloadsPending + " / " + show.episodes + "</div>");
    var classvalue = progress;
    if (classvalue<20) {
        classtoadd = "progress-20"
    }
    if (classvalue>20 && classvalue<60) {
        classtoadd = "progress-40"
    }
    if (classvalue>40 && classvalue<80) {
        classtoadd = "progress-60"
    }
    if (classvalue>80) {
        classtoadd = "progress-80"
    }
    $("> .ui-progressbar-value", this).addClass(classtoadd);
});
