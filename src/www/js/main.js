require.config({
    baseUrl: 'js/lib',
    paths: {
        'lodash': 'lodash/lodash.min',
        'jquery': 'jquery/dist/jquery.min',
        'handlebars': 'handlebars/handlebars.amd'
    }
});

require(['ui/app']);