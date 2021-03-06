var fs = require('fs');
var path = require('path');
var glob = require('glob');
var write = require('write');
var hbs = require('handlebars');

hbs.registerHelper('helperMissing', function() {})
hbs.registerHelper('raw', function(options) {
  return options.fn();
});

function expected(pattern, options) {
  var opts = Object.assign({cwd: path.join(__dirname, '../expected')}, options);
  for (let file of glob.sync(pattern, opts)) {
    var fp = path.join(opts.cwd, file);
    var str = fs.readFileSync(fp, 'utf8');
    var fn = hbs.compile(str);
    fn();
  }
};

expected('shopify-*/**/*.{hbs,json}');
