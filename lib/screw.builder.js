var Screw = (function($) {
  var screw = {
    Unit: function(fn) {
      $(Screw).queue(function() {
        new Screw.ExampleGroup(null, "Top Level", fn, $('body > .describe'));
        $(this).dequeue();
      });
    },

    current_example_group: null,

    example_groups: [],
    examples: [],

    ExampleGroup: function(parent, name, fn, element) {
      Screw.current_example_group = this;
      Screw.example_groups.push(this);
      this.parent = parent;
      this.name = name;
      this.fn = fn;
      this.examples = [];
      this.example_groups = [];
      this.befores = [];
      this.afters = [];

      this.describe = function(name, fn) {
        try {
          this.example_groups.push(new Screw.ExampleGroup(Screw.current_example_group, name, fn));
          return this.example_groups[this.example_groups.length - 1];
        } finally {
          Screw.current_example_group = this;
        }
      }

      this.it = function(name, fn) {
        this.examples.push(new Screw.Example(this, name, fn));
        return this.examples[this.examples.length - 1];
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
        for(var i=0; i < this.examples.length; i++) {
          this.examples[i].run();
        }
        for(var i=0; i < this.example_groups.length; i++) {
          this.example_groups[i].run();
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
        if(child.constructor == Screw.ExampleGroup) {
          this.element.children('.describes').append(child.element);
        } else if(child.constructor == Screw.Example) {
          this.element.children('.its').append(child.element);
        } else {
          throw "Invalid child constructor.name: " + child.constructor.name;
        }
      }

      if(!element) {
        var element_name = 'Screw.example_groups[' + (Screw.example_groups.length - 1) +']'
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

    Example: function(example_group, name, fn) {
      this.parent = example_group;
      Screw.examples.push(this);
      this.name = name;
      this.fn = fn;

      var element_name = "Screw.examples[" + (Screw.examples.length - 1) + "]";
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
    $('<div class="describe" name="Screw.example_groups[0]">')
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