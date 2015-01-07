var assert = require('chai').assert,
    r = require('./rules.js'),
    tests = r.tests,
    innerTests = r.innerTests,
    Typograf = require('../dist/typograf.js'),
    t = new Typograf({lang: 'ru'}),
    _settings;

function pushSettings(ruleName, settings) {
    _settings = {};

    Object.keys(settings).forEach(function(key) {
        _settings[key] = t.setting(ruleName, key);
        t.setting(ruleName, key, settings[key]);
    });
}

function popSettings(ruleName) {
    Object.keys(_settings).forEach(function(key) {
        t.setting(ruleName, key, _settings[key]);
    });
}

function executeRule(name, text) {
    var rules = Typograf.prototype._rules;

    rules.forEach(function(f) {
        if(f.name === name) {
            text = f.func.call(t, text, t._settings[f.name]);
        }
    });

    return text;
}

function executeInnerRule(name, text) {
    var rules = Typograf.prototype._innerRules;

    rules.forEach(function(f) {
        if(f.name === name) {
            text = f.func.call(t, text, t._settings[f.name]);
        }
    });

    return text;
}

describe('rules', function() {
    tests.forEach(function(elem) {
        var name = elem[0];
        it(name, function() {
            elem[1].forEach(function(as) {
                t.enable(name);
                assert.equal(executeRule(name, as[0]), as[1], as[0] + ' → ' + as[1]);
            });
        });
    });

    it('quotes lquot = lquot2 and rquot = rquot2', function() {
        var quotTests = [
            ['"Триллер “Закрытая школа” на СТС"', '«Триллер «Закрытая школа» на СТС»'],
            ['Триллер "Триллер “Закрытая школа” на СТС" Триллер', 'Триллер «Триллер «Закрытая школа» на СТС» Триллер'],
            ['"“Закрытая школа” на СТС"', '«Закрытая школа» на СТС»'],
            ['Триллер "“Закрытая школа” на СТС" Триллер', 'Триллер «Закрытая школа» на СТС» Триллер'],
            ['"Триллер “Закрытая школа"', '«Триллер «Закрытая школа»'],
            ['Триллер "Триллер “Закрытая школа" Триллер', 'Триллер «Триллер «Закрытая школа» Триллер']
        ];

        pushSettings('ru/punctuation/quot', {
            lquot: '«',
            rquot: '»',
            lquot2: '«',
            rquot2: '»'
        });

        quotTests.forEach(function(el) {
            assert.equal(executeRule('ru/punctuation/quot', el[0]), el[1]);
        });

        popSettings('ru/quot');
    });

    it('off ru/optalign', function() {
        var tp = new Typograf();

        tp.disable('*');

        var optAlignTests = [
            '<span class="typograf-oa-sp-lquot"> </span>',
            '<span class="typograf-oa-lquot">«</span>',
            '<span class="typograf-oa-comma">,</span>',
            '<span class="typograf-oa-sp-lbracket"> </span>'
        ];

        optAlignTests.forEach(function(el) {
            assert.equal(tp.execute(el, {lang: 'ru'}), el);
        });
    });
    
    it('enable common/html/stripTags', function() {
        var tp = new Typograf();
        tp.enable('common/html/stripTags');

        var tagTests = [
            ['<p align="center">Hello world!</p> <a href="/">Hello world!</a>\n\n<pre>Hello world!</pre>',
            'Hello world! Hello world!\n\nHello world!'],
            ['<p align="center" Hello world!</p>', '']
        ];

        tagTests.forEach(function(el) {
            assert.equal(tp.execute(el[0]), el[1]);
        });
    });
    
    it('enable common/html/escape', function() {
        var tp = new Typograf();
        tp.enable('common/html/escape');

        var escapeTests = [
            ['<p align="center">\nHello world!\n</p>',
            '&lt;p align=&quot;center&quot;&gt;\nHello world!\n&lt;&#x2F;p&gt;']
        ];

        escapeTests.forEach(function(el) {
            assert.equal(tp.execute(el[0]), el[1]);
        });
    });
});

describe('inner rules', function() {
    innerTests.forEach(function(elem) {
        var name = elem[0];
        it(name, function() {
            elem[1].forEach(function(as) {
                t.enable(name);
                assert.equal(executeInnerRule(name, as[0]), as[1], as[0] + ' → ' + as[1]);
            });
        });
    });
});
