requirejs.config({
    baseUrl: 'static/js/lib',
    paths: {
        jquery: 'jquery-1.11.3',
        bootstrap: 'bootstrap'
    },
    shim: {
        bootstrap: ['jquery']
    }
});
