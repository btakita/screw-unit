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
      run: function() {
        eval($(this).attr('name')).run();
      },
      
      selector: function() {
        var describe = eval($(this).attr('name'));
        var parent = describe.parent.element;
        return parent.fn('selector')
          + ' > .describes > .describe:eq(' + parent.find('.describes').children('.describe').index(this) + ')';
      }
    });
  
    $('body > .describe').fn({
      selector: function() { return 'body > .describe' }
    });
    
    $('.it').fn({
      run: function() {
        eval($(this).attr('name')).run();
      },
      
      selector: function() {
        var it = eval($(this).attr('name'));
        var parent = it.parent.element;
        return parent.fn('selector')
          + ' > .its > .it:eq(' + parent.find('.its').children('.it').index(this) + ')';
      }
    });

    $(Screw).trigger('before');
    var to_run = unescape(location.search.slice(1)) || 'body > .describe > .describes > .describe';
    $(to_run)
      .focus()
      .eq(0).trigger('scroll').end()
      .fn('run');
    $(Screw).queue(function() { $(Screw).trigger('after') });
  })
})(jQuery);
