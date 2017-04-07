function Translator() {
    this.Google_Translate_API_KEY = 'AIzaSyCgB5hmFY74WYB-EoWkhr9cAGr6TiTHrEE';
};

Translator.prototype.setConfig = function (config) {
    this.config = config;
};

Translator.prototype.start = function () {
    this.init();
};


Translator.prototype.init = function () {
    var self = this;

    if (self.recognition)
        self.recognition.stop();

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    this.recognition = new SpeechRecognition();

    this.recognition.lang = this.config.from || 'en-US';

    console.log('SpeechRecognition Language', this.recognition.lang);

    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = function (event) {
        var interim_transcript = '';
        console.dir(event);
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
    };

    this.recognition.onerror = function (e) {
        console.log("error");
        console.dir(e);
        //self.recognition.stop();
    };
    this.recognition.start();
};

Translator.prototype.translate = function (text) {
    var self = this;
    var sourceText = encodeURIComponent(text);

    var url = 'https://www.googleapis.com/language/translate/v2?key=' + this.Google_Translate_API_KEY + '&target=' + this.config.to + '&q=' + sourceText;
    this.xhr(url, function (res) {
        var translateText = encodeURIComponent(res.data.translations[0].translatedText);
        console.log("translate:", translateText);
        self.xhr("/glip/" + self.config.from + "%20:%20%20%20" + sourceText + "%0a" + self.config.to + "%20:%20%20%20" + translateText);
    });
};

Translator.prototype.listLanguage = function (callback) {
    var url = 'https://www.googleapis.com/language/translate/v2/languages?key=' + this.Google_Translate_API_KEY + '&target=' + navigator.language;

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

