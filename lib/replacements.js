const file = require('fs-utils');
const tag = require('./tag');
const _ = require('lodash');

exports.blocks = [
  {
    // {% highlight html %} ... {% endhighlight %}
    pattern: tag.makeBlock('highlight'),
    replacement: function (match, lang, code) {
      return [
        '{{#markdown}}',
        '```' + lang,
        code,
        '```',
        '{{/markdown}}'
      ].join('\n').replace(/\n+/gm, '\n');
    }
  },
  {
    // {% for foo in site.data.bar %} ... {% endfor %}
    pattern: tag.makeBlock('for'),
    replacement: function (match, params, inner) {
      params = params.split(' ');
      var variable = params[0];
      var prop = params[2].split('.').pop();
      return [
        '{{#' + prop + '}}',
        inner.replace(new RegExp(variable, 'g'), 'this'),
        '{{/' + prop + '}}'
      ].join('\n');
    }
  }
];

exports.variables = [
  {
    // {{ content }}
    pattern: tag.makeVariable('content', {matter: ''}),
    replacement: function (match, str) {
      return '{{> body }}';
    }
  },
  {
    // {{ page.title }} => {{ title }}
    pattern: tag.makeVariable('page', {matter: '\\.([\\S]+)'}),
    replacement: function (match, prop) {
      return '{{ ' + prop + ' }}';
    }
  },
  {
    // {{ site.title }} => {{ title }}
    pattern: tag.makeVariable('site', {matter: '\\.([\\S]+)([^\\}]+)'}),
    replacement: function (match, prop, filter) {
      if (/\|/.test(match)) {
        filter = _.compact(filter.split('|').join('').trim().split(':'));
        return '{{! ' + filter.shift() + ' }}';
      } else {
        return match;
      }
    }
  }
];

exports.tags = [
  {
    // {% include foo/bar.html %}
    pattern: tag.makeTag('include', {params: '([\\S]+)'}),
    replacement: function (match, str) {
      return '{{> ' + file.name(str) + ' }}';
    }
  },
  {
    // {% if page.slug == "foo" %}
    pattern: tag.makeTag('if', {params: '([\\S]+)'}),
    replacement: function (match, context, cond) {
      context = context.split('.').pop();
      cond = cond.trim().split(' ').pop();
      return '{{#is ' + context + ' ' + cond + '}}';
    }
  },
  {
    // {% elsif %}
    pattern: tag.makeTag('elsif', {params: '([\\S]+)'}),
    replacement: function (match, context, cond) {
      context = context.split('.').pop();
      cond = cond.trim().split(' ').pop();
      return '{{/is}} {{#is ' + context + ' ' + cond + '}}';
    }
  },
  {
    // {% comment %}
    pattern: tag.makeTag('comment', {matter: ''}),
    replacement: function (match) {
      return '{{#comment}}';
    }
  },
  {
    // {% endcomment %}
    pattern: tag.makeTag('endcomment', {matter: ''}),
    replacement: function (match) {
      return '{{/comment}}';
    }
  },
  {
    // {% else %}
    pattern: tag.makeTag('else', {matter: ''}),
    replacement: function (match) {
      return '{{^}}';
    }
  },
  {
    // {% endif %}
    pattern: tag.makeTag('endif', {matter: ''}),
    replacement: function (match) {
      return '{{/is}}';
    }
  }
];