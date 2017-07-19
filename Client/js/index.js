$(document).ready(function() {
  $('.menu .item .button').tab();
  $('.message .close').on('click', function() {
    $(this).closest('.message').transition('fade');
  });
});
