//from projx.mit.edu, thanks vahid
$(document).ready(function() {
    // jumping to sections
    var $bodytag = $('html, body');
    var sections = ['home', 'about','résumé'];
    sections.forEach(function (section) {
        $('.goto-'+section).click(function (e) {
            $bodytag.animate({
                scrollTop: $('#'+section).offset().top
            }, 400);
        });
    });

});
