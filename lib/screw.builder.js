var Screw = (function($) {
  var screw = new Object();
  screw.current_describe = null;
  screw.get_current_describe = function() {return screw.current_describe};
  screw.describes = [];
  screw.its = [];
  screw.Unit = function(fn) {
    var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
    var fn = new Function(
      "with (Screw.Matchers) { with (Screw.Specifications) { " + contents + " } }"
    );
    $(screw).queue(function() {
      fn.call(screw.describes[0]);
      $(this).dequeue();
    });
  }

  screw.Describe = function(parent, name, element) {
    var run_collection, push_to;
    this.parent = parent;
    screw.current_describe = this;
    screw.describes.push(this);
    this.name = name;
    this.element = element;
    this.children = [];
    this.befores = [];
    this.afters = [];

    this.describe = function(name, fn) {
      try {
        var element = $('<li class="describe" name="Screw.describes[' + Screw.describes.length +']">')
          .append($('<h1>').text(name))
          .append('<ul class="its">')
          .append('<ul class="describes">');
        this.element.children('.describes').append(element);
        var describe = push_to(this.children, new Screw.Describe(this, name, element));
        fn.call(describe);
        return describe;
      } finally {
        Screw.current_describe = this;
      }
    }

    this.it = function(name, fn) {
      var element = $('<li class="it" name="Screw.its['+ Screw.its.length + ']">')
          .append($('<h2>').text(name));
      this.element.children('.its').append(element);
      return push_to(this.children, new Screw.It(this, name, fn, element));
    }

    this.before = function(fn) {
      return push_to(this.befores, new Screw.Before(this, fn));
    }

    this.after = function(fn) {
      return push_to(this.afters, new Screw.After(this, fn));
    }

    this.run = function() {
      run_collection(this.children);
    }

    this.run_befores = function() {
      if(this.parent) this.parent.run_befores();
      run_collection(this.befores);
    }

    this.run_afters = function() {
      if(this.parent) this.parent.run_afters();
      run_collection(this.afters);
    }

    push_to = function(collection, item) {
      return collection.push(item);
    }

    run_collection = function(collection) {
      for(var i=0; i < collection.length; i++) {
        collection[i].run();
      }
    }
  };

  var initialize = function(parent, fn) {
    this.parent = parent;
    this.fn = fn;
    this.run = fn;
  };
  screw.Before = initialize;
  screw.After = initialize;
  screw.It = function(describe, name, fn, element) {
    initialize.call(this, describe, fn);
    Screw.its.push(this);
    this.name = name;
    this.element = element;

    this.run = function() {
      try {
        try {
          this.parent.run_befores();
          fn.call();
          this.element.trigger('passed');
        } finally {
          this.parent.run_afters();
        }
      } catch(e) {
        this.element.trigger('failed', [e]);
      }
    };
  };

  screw.Specifications = new function() {
    this.delegate_to = function(getter, method_name) {
      this[method_name] = function() {
        var object = getter();
        return object[method_name].apply(object, arguments);
      }
    }
    this.delegate_to(screw.get_current_describe, 'describe');
    this.delegate_to(screw.get_current_describe, 'it');
    this.delegate_to(screw.get_current_describe, 'before');
    this.delegate_to(screw.get_current_describe, 'after');
  }

  $(screw).queue(function() { $(screw).trigger('loading') });
  $(function() {
    new Screw.Describe(null, "Top Level", $('<div class="describe" name="Screw.describes[0]">')
      .append('<h3 class="status">')
      .append('<ul class="describes">')
      .appendTo('body'));
    $(screw).dequeue();
    $(screw).trigger('loaded');
  });
  return screw;
})(jQuery);