var Screw = (function($) {
  var screw = new Object();
  screw.current_describe = null;
  screw.describes = [];
  screw.its = [];
  screw.Unit = function(fn) {
    var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
    var fn = new Function(
      "with (Screw.Matchers) { with (Screw.Specifications) { " + contents + " } }"
    );
    $(Screw).queue(function() {
      new Screw.Describe(null, "Top Level", fn, $('body > .describe'));
      $(this).dequeue();
    });
  }

  screw.Describe = function(parent, name, fn, element) {
    var run_collection, push_to;
    Screw.current_describe = this;
    Screw.describes.push(this);
    this.parent = parent;
    this.name = name;
    this.fn = fn;
    this.its = [];
    this.describes = [];
    this.befores = [];
    this.afters = [];

    this.describe = function(name, fn) {
      try {
        return push_to(this.describes, new Screw.Describe(Screw.current_describe, name, fn));
      } finally {
        Screw.current_describe = this;
      }
    }

    this.it = function(name, fn) {
      return push_to(this.its, new Screw.It(this, name, fn));
    }

    this.before = function(fn) {
      return push_to(this.befores, new Screw.Before(this, fn));
    }

    this.after = function(fn) {
      return push_to(this.afters, new Screw.After(this, fn));
    }

    this.run = function() {
      run_collection(this.its);
      run_collection(this.describes);
    }

    this.run_befores = function() {
      if(this.parent) this.parent.run_befores();
      run_collection(this.befores);
    }

    this.run_afters = function() {
      if(this.parent) this.parent.run_afters();
      run_collection(this.afters);
    }

    this.append = function(child) {
      if(child.constructor == Screw.Describe) {
        this.element.children('.describes').append(child.element);
      } else if(child.constructor == Screw.It) {
        this.element.children('.its').append(child.element);
      } else {
        throw "Invalid child constructor.name: " + child.constructor.name;
      }
    }

    push_to = function(collection, item) {
      collection.push(item);
      return item;
    }

    run_collection = function(collection) {
      for(var i=0; i < collection.length; i++) {
        collection[i].run();
      }
    }

    if(!element) {
      var element_name = 'Screw.describes[' + (Screw.describes.length - 1) +']'
      this.element = $('<li class="describe" name="' + element_name + '">')
        .append($('<h1>').text(name))
        .append('<ol class="befores">')
        .append('<ul class="its">')
        .append('<ul class="describes">')
        .append('<ol class="afters">');
      this.parent.append(this);
    } else {
      this.element = element;
    }
    fn.call(this);
  };

  var callback = function(example_group, fn) {
    this.parent = example_group;
    this.fn = fn;
    this.run = fn;
  };

  screw.Before = callback;
  screw.After = callback;

  screw.It = function(example_group, name, fn) {
    this.parent = example_group;
    Screw.its.push(this);
    this.name = name;
    this.fn = fn;

    var element_name = "Screw.its[" + (Screw.its.length - 1) + "]";
    this.element = $('<li class="it" name="'+ element_name + '">')
        .append($('<h2>').text(name));

    this.parent.append(this);
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

  screw.Specifications = {
    describe: function(name, fn) {
      return Screw.current_describe.describe(name, fn);
    },

    it: function(name, fn) {
      return Screw.current_describe.it(name, fn);
    },

    before: function(fn) {
      return Screw.current_describe.before(fn);
    },

    after: function(fn) {
      return Screw.current_describe.after(fn);
    }
  }

  $(screw).queue(function() { $(screw).trigger('loading') });
  $(function() {
    $('<div class="describe" name="Screw.describes[0]">')
      .append('<h3 class="status">')
      .append('<ol class="befores">')
      .append('<ul class="describes">')
      .append('<ol class="afters">')
      .appendTo('body');
    $(screw).dequeue();
    $(screw).trigger('loaded');
  });
  return screw;
})(jQuery);