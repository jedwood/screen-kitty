// var translateURLBase = 'https://translate.google.com/translate_tts?tl=en&q=';
// var translateURLBase = 'http://tts-api.com/tts.mp3?q=';

var moment = require('moment');
var _ = require('lodash');

var timerURLBase = 'GOOGLE-APPS-SCRIPT-URL-HERE';
var translateURLBase = 'http://tts-proxy.herokuapp.com/g?q=';

var mainRac = new Ractive({
  el: '#main',
  template: '#main_tpl',
  data: {
    isLoading: true,
    intro: null
  }
});

mainRac.on('startPlaying', function(evt) {
  console.log("startPlaying");
  startPlay();
});

mainRac.on('stopPlaying', function(evt) {
  stopPlay();
});

mainRac.observe('wordSoundURL', function(evt) {
  setTimeout(function(){
    $('#leword')[0].play();
  }, 3000);
});

mainRac.observe('timeLeft', function(evt) {
  var toSpeak = '';
  var timeLeft = this.get('timeLeft');
  if (timeLeft == 0) {
    toSpeak = "Time's Up! Go outside and play."
    mainRac.set('timesUp', true);
  } else {
    mainRac.set('timesUp', false);
    toSpeak = "You have " + timeLeft + " minutes of screen time left."
  }
  speakIt(toSpeak);
});

$(function(){
  getTime();
});

var pubnub = PUBNUB.init({
  publish_key: 'demo',
  subscribe_key: 'YOUR-KEY-HERE'
});

pubnub.subscribe({
  channel: 'screen_limit',
  message: function(m){
    console.log(m);
    mainRac.set('timeLeft', parseInt(m, 10));
  }
});

function speakIt(msg) {
  mainRac.set('wordSoundURL',  translateURLBase + msg);
}

function startPlay() {
  mainRac.set('isPlaying', true);
  $.ajax({
      url: timerURLBase + "start",
      dataType: "jsonp",
      success: function( data ) {
        mainRac.set('isPlaying', true);
      }
  });
}

function stopPlay() {
  mainRac.set('isPlaying', false);
  $.ajax({
      url: timerURLBase + "stop",
      dataType: "jsonp",
      success: function( data ) {
        mainRac.set('isPlaying', false);
      }
  });
}

function getTime() {
  $.ajax({
      url: timerURLBase + "time",
      dataType: "jsonp",
      success: function( data ) {
        mainRac.set('timeLeft', parseInt(data.timeLeft, 10));
        mainRac.set('isPlaying', data.isPlaying == true || data.isPlaying == "true");
        mainRac.set('isLoading', false);
      }
  });
}