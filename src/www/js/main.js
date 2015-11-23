require.config({
    baseUrl: 'js/lib',
    paths: {
        'lodash': 'lodash/lodash.min',
        'jquery': 'jquery/dist/jquery.min',
        'handlebars': 'handlebars/handlebars.amd.min'
    }
});

require(['ui/app']);