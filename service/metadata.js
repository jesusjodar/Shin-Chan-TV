'use strict';
var https=require('https'),url=require('url'),mp4=require('./mp4');
module.exports=function(link,done){
  var target=url.parse(link), tries=0;
  function read(offset) {
    if(++tries>8)return done(new Error('No se encontró la duración del MP4.'));
    var completed=false;
    function finish(err,value){if(completed)return;completed=true;done(err,value);}
    var req=https.get({hostname:target.hostname,path:target.path,headers:{'Referer':'https://shinchaneros.tv/','User-Agent':'Mozilla/5.0','Range':'bytes='+offset+'-'+(offset+65535)}},function(res){
      if(res.statusCode!==206){res.destroy();return finish(new Error('El servidor no permite leer metadatos por rango.'));}
      var chunks=[],length=0;
      res.on('data',function(chunk){length+=chunk.length;if(length>65536){req.destroy();finish(new Error('Metadatos MP4 demasiado grandes.'));}else chunks.push(chunk);});
      res.on('error',finish);
      res.on('end',function(){
        if(completed)return;
        try {
          var data=Buffer.concat(chunks), at=0;
          while(at+8<=data.length) {
            var box=mp4.header(data,at);if(!box||!box.size)break;
            // shortcut: mvhd must be in the first 64 KiB of moov; extend this bounded read if the provider changes box ordering.
            if(box.type==='moov'){var seconds=mp4.duration(data,at);if(seconds)return finish(null,seconds);break;}
            if(at+box.size>data.length){completed=true;return read(offset+at+box.size);}
            at+=box.size;
          }
          finish(new Error('No se pudo leer la duración.'));
        }catch(e){finish(e);}
      });
    });
    req.setTimeout(15000,function(){req.destroy(new Error('La duración tarda demasiado en responder.'));});req.on('error',finish);
  }
  read(0);
};
