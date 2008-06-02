(function($) {
  $(Screw).bind('loaded', function() {
    $('.status').fn({
      display: function() {
        $(this).text(
          $('.passed').length + $('.failed').length + ' test(s), ' + $('.failed').length + ' failure(s)'
        );
      }
    });

    $('.describe').fn({
      enqueue: function() {
        var example_group = eval($(this).attr('name'));
        example_group.run();
      },
      
      selector: function() {
        var example_group = eval($(this).attr('name'));
        var parent = example_group.parent.element;
        return parent.fn('selector')
          + ' > .describes > .describe:eq(' + parent.find('.describes').children('.describe').index(this) + ')';
      }
    });
  
    $('body > .describe').fn({
      selector: function() { return 'body > .describe' }
    });
    
    $('.it').fn({
      enqueue: function() {
        $(Screw)
          .queue(function() {
            var example = eval($(this).attr('name'));
            example.run();
            setTimeout(function() { $(Screw).dequeue() }, 0);
          });
      },
      
      selector: function() {
        var example = eval($(this).attr('name'));
        var parent = example.parent.element
        return parent.fn('selector')
          + ' > .its > .it:eq(' + parent.find('.its').children('.it').index(this) + ')';
      }
    });

    $(Screw).trigger('before');
    var to_run = unescape(location.search.slice(1)) || 'body > .describe > .describes > .describe';
    $(to_run)
      .focus()
      .eq(0).trigger('scroll').end()
      .fn('enqueue');
    $(Screw).queue(function() { $(Screw).trigger('after') });
  })
})(jQuery);
