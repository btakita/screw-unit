var Screw = (function($) {
  var screw = {
    Unit: function(fn) {
      $(Screw).queue(function() {
        new Screw.Describe(null, "Top Level", fn, $('body > .describe'));
        $(this).dequeue();
      });
    },

    current_example_group: null,

    describes: [],
    its: [],

    Describe: function(parent, name, fn, element) {
      Screw.current_example_group = this;
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
          this.describes.push(new Screw.Describe(Screw.current_example_group, name, fn));
          return this.describes[this.describes.length - 1];
        } finally {
          Screw.current_example_group = this;
        }
      }

      this.it = function(name, fn) {
        this.its.push(new Screw.It(this, name, fn));
        return this.its[this.its.length - 1];
      }

      this.before = function(fn) {
        this.befores.push(new Screw.Before(this, fn));
        return this.befores[this.befores.length - 1];
      }

      this.after = function(fn) {
        this.afters.push(new Screw.After(this, fn));
        return this.afters[this.afters.length - 1];
      }

      this.run = function() {
        for(var i=0; i < this.its.length; i++) {
          this.its[i].run();
        }
        for(var i=0; i < this.describes.length; i++) {
          this.describes[i].run();
        }
      }

      this.run_befores = function() {
        if(this.parent) this.parent.run_befores();
        for(var i=0; i < this.befores.length; i++) {
          this.befores[i].run();
        }
      }

      this.run_afters = function() {
        if(this.parent) this.parent.run_afters();
        for(var i=0; i < this.afters.length; i++) {
          this.afters[i].run();
        }
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

      if(!element) {
        var element_name = 'Screw.describes[' + (Screw.describes.length - 1) +']'
        this.element = $('<li class="describe" name="' + element_name + '">')
          .append($('<h1>').text(name))
          .append('<ol class="befores">')
          .append('<ul class="its">')
          .append('<ul class="describes">')
          .append('<ol class="afters">');
        this.parent.append(this);
        fn.call(this);
      } else {
        this.element = element;
        var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
        var fn = new Function("matchers", "specifications",
          "with (matchers) { with (specifications) { " + contents + " } }"
        );
        fn.call(this, Screw.Matchers, Screw.Specifications);
      }
    },

    Before: function(example_group, fn) {
      this.parent = example_group;
      this.name = "Before";
      this.fn = fn;

      this.run = fn;
    },

    After: function(example_group, fn) {
      this.parent = example_group;
      this.name = "After";
      this.fn = fn;

      this.run = fn;
    },

    It: function(example_group, name, fn) {
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
    },

    Specifications: {
      describe: function(name, fn) {
        return Screw.current_example_group.describe(name, fn);
      },

      it: function(name, fn) {
        return Screw.current_example_group.it(name, fn);
      },

      before: function(fn) {
        return Screw.current_example_group.before(fn);
      },

      after: function(fn) {
        return Screw.current_example_group.after(fn);
      }
    }
  };

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