var token;
var interval = 100;		// msec
var repeat = 50;		// n x interval = timeout ... 50 x 100 = 5000 msec de timeout ...
var cnt = 0;
var cpt_initial;

exports.init = function () {
    info('[ GoogleTranslate ] is initializing ...');
}

exports.action = function(data, callback){

	// valeur initiale du compteur ...
	cpt_initial = SARAH.context.SpeechReco.compteur;
	cnt = 0;
	token = setInterval(function() {
		checkSpeechReco(SARAH, callback, data)
	}, interval);
}

function checkSpeechReco(SARAH, callback, data) {
	var new_cpt = SARAH.context.SpeechReco.compteur;
	
	if (new_cpt != cpt_initial) {

		var search = SARAH.context.SpeechReco.lastReco;
		console.log ("Search: " + search);
		// On prend pas en compte la langue ici pour éviter d'avoir un regex pour chaque langues du xml
		var rgxp = /(traduit|traduis|traduire|tu peux traduire|donne moi le mot|comment on dit|peux tu me traduire) (.+) en (.+)/i;
		// on s'assure que Google a bien compris
		var match = search.trim().match(rgxp);
		if (!match || match.length <= 1){
			console.log("FAIL");
			clearInterval(token);
			return callback({ 'tts': "Je ne comprends pas" });
		}
		// on peut maintenant s'occuper du/des mots qui sont recherchés
		search = match[2];
		clearInterval(token);
		console.log("Cnt: " + cnt);
		return getTraduction(search, callback, data.lang, data.langue);
	} else {
		cnt += interval;
		if (cnt > (interval * repeat)) {
			callback({'tts': "Google Chrome n'a pas répondu assez vite"});
			clearInterval(token);
			return;
		}
	}
}

var getTraduction = function(search, callback, lang, language) {
	search = search.trim();
	search = search.toLowerCase();

	var nomcherchercomplet = 'https://translate.google.com/?q=' + search + '&sl=auto&tl=' + lang + '#auto/' + lang + '/' + search;

	var request = require('request');
	var cheerio = require('cheerio');

    var url = nomcherchercomplet;
    request({ 'uri': url, 'headers': { 'Accept-Charset': 'utf-8' }, 'encoding': 'binary' }, function(error, response, html) {

        var $ = cheerio.load(html, { xmlMode: false, ignoreWhitespace: false, lowerCaseTags: false });

        var resultat = $('#gt-res-c #gt-res-content span#result_box').text().trim();

        console.log('=[ Traduction de ' + search + ' en ' + language + ' ]=');
        console.log('Résultat: ' + resultat);

        callback({ 'tts': search + " en " + language + " se dit " + resultat });
        return;
    });
}