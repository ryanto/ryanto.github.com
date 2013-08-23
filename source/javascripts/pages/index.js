jQuery(document).ready(function($) {
  var scrollTo = function(name) {
    return function() {
      var element = $(name),
          options = {
            offset: { top: -44 }
          };

      if (element.length > 0) {
        event.preventDefault();
        return $.scrollTo(element, 500, options);
      }
    };
  };

  $("nav a.about").click(scrollTo("section.what-we-do"));
  $("nav a.projects").click(scrollTo("section.featured-project"));
});
