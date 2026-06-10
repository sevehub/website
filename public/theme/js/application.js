!function ($) {
  $(function(){

    // Activate Bootstrap's tooltips
    $('[data-toggle="tooltip"]').tooltip()
    // Tipue Search results styling.
    $("#tipue_search_results_count").addClass('text-muted small float-right');
    $("#tipue_search_image_modal").addClass('d-none');
    $(".tipue_search_result").addClass('border-bottom border-secondary mb-4 pb-3');
    $(".tipue_search_content_title").addClass('h3');
    $(".tipue_search_content_bold").addClass('bg-warning rounded px-1');
    $(".tipue_search_content_url").addClass('small text-info');
    $(".tipue_search_image").addClass('float-left border rounded');
    $(".tipue_search_note").addClass('d-none');

    console.log("application script")
  });
}(window.jQuery);
