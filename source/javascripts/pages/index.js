jQuery(document).ready(function($) {
  var scrollTo = function(name) {
    return function() {
      event.preventDefault();
      return $.scrollTo(
        $(name),
        500,
        {
          offset: {
            top: -44
          }
        }
      );
    };
  };

  $("nav a.about").click(scrollTo("section.what-we-do"));
  $("nav a.projects").click(scrollTo("section.featured-project"));
});
