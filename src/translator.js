function Translator() {
    this.Google_Translate_API_KEY = 'AIzaSyCgB5hmFY74WYB-EoWkhr9cAGr6TiTHrEE';
};

Translator.prototype.setConfig = function (config) {
    this.config = config;
};

Translator.prototype.start = function () {
    this.init();
    this.recognition.start();
};

Translator.prototype.init = function () {
    var self = this;
    if (this.recognition)
        this.recognition.stop();

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    this.recognition = new SpeechRecognition();

    this.recognition.lang = this.config.from || 'en-US';

    console.log('SpeechRecognition Language', this.recognition.lang);

    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = function (event) {
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                var text = event.results[i][0].transcript;

                console.log("Voice:", text);

                self.translate(text)
            }
        }
    };

    this.recognition.onend = function () {
        console.log("restart");
        self.init();
    };

    this.recognition.onerror = function (e) {
        console.log("error");
        console.dir(e);
    };
};

Translator.prototype.translate = function (text) {
    var self = this;
    var sourceText = encodeURIComponent(text);

    var url = 'https://www.googleapis.com/language/translate/v2?key=' + this.Google_Translate_API_KEY + '&target=' + this.config.to + '&q=' + sourceText;
    this.xhr(url, function (res) {
        console.log("translate:", res);
        self.xhr("http://localhost:8000/glip/" + encodeURIComponent(res.data.translations[0].translatedText));
    });
};

Translator.prototype.listLanguage = function (callback) {
    var url = 'https://www.googleapis.com/language/translate/v2/languages?key=' + this.Google_Translate_API_KEY + '&target=en';

    this.xhr(url, function (res) {
        if (res && res.data && res.data.languages) {
            callback(res.data.languages);
        }
    });
};

Translator.prototype.xhr = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            callback && callback(JSON.parse(xhr.responseText));
        }
    };
    xhr.open('GET', url, true);
    xhr.send(null);
};

