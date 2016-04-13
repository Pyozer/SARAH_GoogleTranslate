var ScribeSpeak;
var token;
var TIME_ELAPSED;
var FULL_RECO;
var PARTIAL_RECO;
var TIMEOUT_SEC = 10000;

exports.init = function () {
    info('[ GoogleTranslate ] is initializing ...');
}

exports.action = function(data, callback){

	ScribeSpeak = SARAH.ScribeSpeak;

	FULL_RECO = SARAH.context.scribe.FULL_RECO;
	PARTIAL_RECO = SARAH.context.scribe.PARTIAL_RECO;
	TIME_ELAPSED = SARAH.context.scribe.TIME_ELAPSED;

	SARAH.context.scribe.activePlugin('GoogleTranslate');

	var util = require('util');
	console.log("GoogleTranslate call log: " + util.inspect(data, { showHidden: true, depth: null }));

	SARAH.context.scribe.hook = function(event) {
		checkScribe(event, data.action, callback, data); 
	};
	
	token = setTimeout(function(){
		SARAH.context.scribe.hook("TIME_ELAPSED");
	}, TIMEOUT_SEC);
}

function checkScribe(event, action, callback, data) {

	if (event == FULL_RECO) {
		clearTimeout(token);
		SARAH.context.scribe.hook = undefined;
		// aurait-on trouvé ?
		decodeScribe(SARAH.context.scribe.lastReco, callback, data);

	} else if(event == TIME_ELAPSED) {
		// timeout !
		SARAH.context.scribe.hook = undefined;
		// aurait-on compris autre chose ?
		if (SARAH.context.scribe.lastPartialConfidence >= 0.7 && SARAH.context.scribe.compteurPartial > SARAH.context.scribe.compteur) {
			decodeScribe(SARAH.context.scribe.lastPartial, callback, data);
		} else {
			SARAH.context.scribe.activePlugin('Aucun (GoogleTranslate)');
			//ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
			return callback({ 'tts': "Désolé je n'ai pas compris. Merci de réessayer." });
		}
		
	} else {
		// pas traité
	}
}

function decodeScribe(search, callback, data) {

	console.log ("Search: " + search);
	// On prend pas en compte la langue ici pour éviter d'avoir un regex pour chaque langues du xml
	var rgxp = /(traduit|traduis|traduire|donne moi le mot|comment on dit) (.+) en (.+)/i;
	// on s'assure que Google a bien compris
	var match = search.trim().match(rgxp);
	if (!match || match.length <= 1){
		SARAH.context.scribe.activePlugin('Aucun (GoogleTranslate)');
		//ScribeSpeak("Désolé je n'ai pas compris.", true);
		return callback({ 'tts': "Désolé je n'ai pas compris." });
	}
	// on peut maintenant s'occuper du/des mots qui sont recherchés
	search = match[2];
	return getTraduction(search, callback, data.lang, data.langue);
}

var getTraduction = function(search, callback, lang, language) {
	search = search.trim();
	search = search.toLowerCase();
	var url = 'https://translate.google.com/?q=' + search + '&sl=auto&tl=' + lang + '#auto/' + lang + '/' + search;

	var request = require('request');
	var cheerio = require('cheerio');

	var options = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
		'Accept-Charset': 'utf-8'
	};

    request({ 'uri': url, 'headers': options, 'encoding': 'binary' }, function(error, response, html) {

        var $ = cheerio.load(html, { xmlMode: false, ignoreWhitespace: false, lowerCaseTags: false });

        var resultat = $('#gt-res-c #gt-res-content span#result_box').text().trim();

        if(resultat == "") {
        	console.log("Impossible de récupérer les informations sur Google Translate");
        	//ScribeSpeak("Désolé, je n'ai pas réussi à récupérer d'informations");
			callback({ 'tts': "Désolé, je n'ai pas réussi à récupérer d'informations" });
        } else {
			console.log('=[ Traduction de ' + search + ' en ' + language + ' ]=');
	        console.log('Résultat: ' + resultat);
	        //ScribeSpeak(search + " en " + language + " se dit " + resultat);
	        callback({ 'tts': search + " en " + language + " se dit " + resultat });
        }
        return;
    });
}