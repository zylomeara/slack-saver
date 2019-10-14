(function() {
    var XHR = XMLHttpRequest.prototype;
    // Remember references to original methods
    var open = XHR.open;
    var send = XHR.send;

    // Overwrite native methods
    // Collect data:
    XHR.open = function(method, url) {
        this._method = method;
        this._url = url;
        return open.apply(this, arguments);
    };

    // Implement "ajaxSuccess" functionality
    XHR.send = function(postData) {
        this.addEventListener('load', function() {
            if (this._url.includes('conversations')) {
                console.log({
                    method: this._method,
                    url: this._url,
                    responseText: this.responseText,
                    postData: postData
                });
            }
        });
        return send.apply(this, arguments);
    };
})();
