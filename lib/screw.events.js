(function($) {
  Screw.Describe.describe(function(parent, name) {
    var element = $('<li class="describe" name="Screw.describes[' + Screw.describes.length +']">')
      .append($('<h1>').text(name))
      .append('<ul class="its">')
      .append('<ul class="describes">');
    parent.element.children('.describes').append(element);
    return element;
  });

  Screw.Describe.it(function(parent, name) {
    var element = $('<li class="it" name="Screw.its['+ Screw.its.length + ']">')
          .append($('<h2>').text(name));
    parent.element.children('.its').append(element);
    return element;
  });

  $(Screw)
    .bind('loaded', function() {    
      $('.describe, .it')
        .click(function() {
          document.location = location.href.split('?')[0] + '?' + $(this).fn('selector');
          return false;
        })
        .focus(function() {
          return $(this).addClass('focused');
        })
        .bind('scroll', function() {
          document.body.scrollTop = $(this).offset().top;
        });

      $('.it')
        .bind('enqueued', function() {
          $(this).addClass('enqueued');
        })
        .bind('running', function() {
          $(this).addClass('running');
        })
        .bind('passed', function() {
          $(this).addClass('passed');
        })
        .bind('failed', function(e, reason) {
          $(this)
            .addClass('failed')
            .append($('<p class="error">').text(reason.toString()));
        })
    })
    .bind('before', function() {
      $('.status').text('Running...');
    })
    .bind('after', function() {
      $('.status').fn('display')
    })
})(jQuery);