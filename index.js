
//srt = import-srt.js <- npm srt2json
var frame = {'ref':0,'start':"",'finish':"",'subtitle':""}
var subs = srt.split('\n').reduce(reducer,[clone(frame)])

function clone(obj) {
    return Object.create(obj);
}

function convertToMS(timecode){
//    [hours,minutes,milliseconds] = timecode.split(':');
    hours = timecode.split(':')[0];
    minutes = timecode.split(':')[1];
    milliseconds = timecode.split(':')[2];
    return (hours*60+minutes)*60000 + parseInt(milliseconds.replace(',',''))
}

function reducer(p,c,i,a){
    if (c.length===0){
        p.push(clone(frame))
       // console.log('CLOSEFRAME')
    } else if (Number(c)>0) {
       // console.log('NEWFRAME')
        Object.assign(p[p.length-1], {ref: c, subtitle:""})
    } else if (c.indexOf('-->')===13){
       // console.log('TIMECODE')
       Object.assign(p[p.length-1], {
            'timecode': c,
            'startms': convertToMS(c.split(' --> ')[0]),
            'finishms': convertToMS(c.split(' --> ')[1]),
            'duration': convertToMS(c.split(' --> ')[1]) - convertToMS(c.split(' --> ')[0])
        } )

    } else {
        p[p.length-1].subtitle += c + "\n"
    }
    return p;
}

var app = new Vue({
  el: '#app',
  data: {
    startClock: performance.now()|0,
    subtitles: subs,
    elapsed: 0,
    subtitle: "",
    seq:0
  },
  computed: {
    duration: function(){
    	return this.subtitles[this.position].duration
    },
    timecode: function(){
    	return this.subtitles[this.position].timecode
    },
    endClock: function(){
    	return this.subtitles[this.subtitles.length-1].finishms
    }
  },
  methods: {
  	next: function(){
    	this.subtitle = this.getSub(performance.now())
      this.seq= this.subtitle.ref||this.seq
      this.elapsed = (performance.now()|0) - this.startClock
    },
    getSub: function(ms){
      return this.subtitles.reduce(
        (p,c,i,a)=> {
          if ((c.startms+this.startClock)<ms && (c.finishms+this.startClock>ms)){
            p = c
          }
          return p
        }, "")
			},
      play:function() {
        setTimeout(function() {
          this.next();
          this.play();
        }, 111);
      }
  }
})

function switchSub() {
  setTimeout(function() {
    app.next()
    switchSub();
  }, 100);
}
switchSub()
