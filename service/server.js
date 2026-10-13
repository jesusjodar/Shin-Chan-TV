'use strict';
var http = require('http'), https = require('https'), url = require('url'), crypto = require('crypto');
var metadata=require('./metadata'), durations={};
var utf8=require('./utf8');
var catalog = require('./catalog'), cache = {}, links = {}, token = crypto.randomBytes(24).toString('hex');
var PORT = 18766, touched = Date.now();
function getPage(path, done) {
  if (cache[path] && Date.now()-cache[path].at < (path.indexOf('/api/favorites')===0?300000:3600000)) return done(null, cache[path].html);
  var req = https.get({hostname:'shinchaneros.tv',path:path,headers:{'User-Agent':'Mozilla/5.0','Referer':'https://shinchaneros.tv/'}},function(res){
    // Acumular bytes y decodificar al final: un carácter multibyte (ñ, é…)
    // puede llegar partido entre dos trozos TCP y romperse al unir texto.
    var chunks = [], length = 0;
    res.on('data',function(chunk){chunks.push(chunk); length+=chunk.length; if(length>6000000) req.destroy(new Error('Respuesta demasiado grande.'));});
    res.on('end',function(){
      if (res.statusCode!==200) return done(new Error('ShinChaneros ha respondido con HTTP '+res.statusCode+'.'));
      var body = utf8.joinChunks(chunks);
      cache[path] = {html:body,at:Date.now()}; done(null,body);
    });
  });
  req.setTimeout(20000,function(){req.destroy(new Error('La web tarda demasiado en responder.'));});
  req.on('error',done);
}
function mediaPage(key){return key.indexOf('movie/')===0?'/movies/'+key.slice(6):'/seasons/'+key;}
function json(res,status,value){if(res.writableEnded) return; res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'}); res.end(JSON.stringify(value));}
var server = http.createServer(function(req,res){
  var parsed = url.parse(req.url,true), path = parsed.pathname, match;
  if (parsed.query.token !== token) return json(res,403,{error:'Acceso local no autorizado.'});
  touched = Date.now();
  if ((match=/^\/collection\/(movies|favorites|specials|travel|fear)$/.exec(path))) {
    var collection=match[1];
    function parsedPage(page,parse){getPage(page,function(err,html){try{if(err)throw err;json(res,200,parse(html));}catch(e){json(res,502,{error:e.message});}});}
    if(collection==='movies')return parsedPage('/movies',catalog.movies);
    if(collection==='favorites')return parsedPage('/api/favorites/ranking?limit=9',catalog.favorites);
    return getPage('/',function(err,html){
      try{if(err)throw err;var script=catalog.homeScript(html);}catch(e){return json(res,502,{error:e.message});}
      getPage(script,function(err,js){
        try{if(err)throw err;var chunk=catalog.collectionChunks(js)[collection];}catch(e){return json(res,502,{error:e.message});}
        parsedPage(chunk,catalog.themed);
      });
    });
  }
  if (path==='/seasons') return getPage('/seasons',function(err,html){try{if(err) throw err; json(res,200,catalog.seasons(html));}catch(e){json(res,502,{error:e.message});}});
  if ((match=/^\/episodes\/(\d+)$/.exec(path))) return getPage('/seasons/'+match[1],function(err,html){try{if(err) throw err; json(res,200,catalog.episodes(html,+match[1]));}catch(e){json(res,502,{error:e.message});}});
  if ((match=/^\/duration\/((?:\d+\/\d+)|(?:movie\/[a-z0-9-]+))$/.exec(path))) {
    var durationKey=match[1];
    if(durations[durationKey])return json(res,200,durations[durationKey]);
    return getPage(mediaPage(durationKey),function(err,html){
      try {if(err)throw err; var media=catalog.video(html);}
      catch(e){return json(res,502,{error:e.message});}
      metadata(media,function(error,seconds){if(error)return json(res,502,{error:error.message});durations[durationKey]={seconds:seconds,description:durationKey.indexOf('movie/')===0?catalog.description(html):undefined};json(res,200,durations[durationKey]);});
    });
  }
  if ((match=/^\/resolve\/((?:\d+\/\d+)|(?:movie\/[a-z0-9-]+))$/.exec(path))) {
    var key=match[1];
    return getPage(mediaPage(key),function(err,html){try{if(err) throw err; links[key]=catalog.video(html); json(res,200,{url:'/video/'+key});}catch(e){json(res,502,{error:e.message});}});
  }
  if ((match=/^\/video\/((?:\d+\/\d+)|(?:movie\/[a-z0-9-]+))$/.exec(path))) {
    var link=links[match[1]];
    if(!link) return json(res,404,{error:'Selecciona de nuevo el episodio.'});
    var target=url.parse(link), headers={'Referer':'https://shinchaneros.tv/','User-Agent':'Mozilla/5.0'};
    if(req.headers.range) headers.Range=req.headers.range;
    var upstream = https.request({hostname:target.hostname,path:target.path,method:req.method==='HEAD'?'HEAD':'GET',headers:headers},function(remote){
      if(remote.statusCode!==200 && remote.statusCode!==206) {remote.resume();return json(res,502,{error:'El servidor de vídeo no está disponible.'});}
      var outgoing={'Content-Type':'video/mp4','Access-Control-Allow-Origin':'*','Accept-Ranges':'bytes','Cache-Control':'no-store'};
      ['content-length','content-range'].forEach(function(k){if(remote.headers[k]) outgoing[k]=remote.headers[k];});
      res.writeHead(remote.statusCode,outgoing); remote.pipe(res);
      remote.on('error',function(){res.destroy();});
    });
    upstream.setTimeout(30000,function(){upstream.destroy(new Error('Tiempo de espera del vídeo agotado.'));});
    upstream.on('error',function(e){if(!res.headersSent) json(res,502,{error:e.message});else res.destroy();});
    res.on('close',function(){upstream.destroy();}); upstream.end(); return;
  }
  json(res,404,{error:'Ruta desconocida.'});
});
function start(done){
  if(server.listening) return done(null);
  server.once('error',done);
  server.listen(PORT,'127.0.0.1',function(){server.removeListener('error',done);done(null);});
}
if(process.env.SHINCHAN_PREVIEW==='1') {
  start(function(err){if(err) throw err; console.log(JSON.stringify({base:'http://127.0.0.1:'+PORT,token:token}));});
} else {
  var Service = require('webos-service'), service = new Service('com.shinchaneros.tv.service');
  // The app renews this lease; it expires when the app closes.
  service.activityManager.create('videoLease',function(activity){
    setInterval(function(){if(Date.now()-touched>90000){server.close(); service.activityManager.complete(activity,function(){});}},30000);
  });
  service.register('start',function(message){touched=Date.now();start(function(err){message.respond(err?{returnValue:false,errorText:err.message}:{returnValue:true,base:'http://127.0.0.1:'+PORT,token:token});});});
  service.register('ping',function(message){touched=Date.now(); message.respond({returnValue:true});});
}
