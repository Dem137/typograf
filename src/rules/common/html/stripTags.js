Typograf.rule({
    title: 'Удаление HTML-тегов',
    name: 'common/html/stripTags',
    sortIndex: 100,
    queue: 'end',
    func: function(text) {
        return text.replace(/<\/?[^>]+>/g, '');
    },
    enabled: false
});
