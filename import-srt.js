function clone(obj) {
    return Object.create(obj);
}

function convertToMilliSeconds(timecode){
    [hours,minutes,milliseconds] = timecode.split(':');
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
            'startms': convertToMilliSeconds(c.split(' --> ')[0]),
            'finishms': convertToMilliSeconds(c.split(' --> ')[1]),
            'duration': convertToMilliSeconds(c.split(' --> ')[1]) - convertToMilliSeconds(c.split(' --> ')[0])
        } )

    } else {
        p[p.length-1].subtitle += c + "\n"
    }
    return p;
}

var frame = {'ref':0,'start':"",'finish':"",'subtitle':""}
srt.split('\n').reduce(reducer,[clone(frame)])
