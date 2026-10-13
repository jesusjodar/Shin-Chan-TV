'use strict';
function payloads(html) {
  var result = [], re = /self\.__next_f\.push\((\[1,.*?\])\)<\/script>/g, m;
  while ((m = re.exec(html))) { try { result.push(JSON.parse(m[1])[1]); } catch (_) {} }
  if (!result.length) throw new Error('La web no ha enviado el catálogo.');
  return result.join('');
}
function seasons(html) {
  var text = payloads(html), re = /"href":"\/seasons\/(\d+)"/g, m, ids = [];
  while ((m = re.exec(text))) if (ids.indexOf(+m[1]) < 0) ids.push(+m[1]);
  if (!ids.length) throw new Error('No se encontraron temporadas.');
  return ids.sort(function(a,b){ return a-b; });
}
function walk(value, fn, records, seen) {
  seen = seen || {};
  if (typeof value === 'string' && records) {
    var reference = /^\$L?([a-f0-9]+)$/.exec(value);
    if (reference && !seen[reference[1]]) {seen[reference[1]]=true; walk(records[reference[1]], fn, records, seen);}
    return;
  }
  if (!value || typeof value !== 'object') return;
  fn(value);
  Object.keys(value).forEach(function(k){ walk(value[k], fn, records, seen); });
}
function episodes(html, season) {
  var results = [], seen = {}, records = {};
  payloads(html).split('\n').forEach(function(line){
    var colon=line.indexOf(':');
    try {records[line.slice(0,colon)] = JSON.parse(line.slice(colon+1));} catch (_) {}
  });
  payloads(html).split('\n').forEach(function(line){
    var colon = line.indexOf(':'), tree;
    try { tree = JSON.parse(line.slice(colon + 1)); } catch (_) { return; }
    walk(tree, function(v){
      if (!Array.isArray(v) || !v[3] || typeof v[3].href !== 'string') return;
      var match = new RegExp('^/seasons/' + season + '/(\\d+)$').exec(v[3].href);
      if (!match || seen[match[1]]) return;
      var titles = [], thumbnail = '';
      walk(v[3].children, function(n){
        if (Array.isArray(n) && n[1] === 'li' && n[3] && typeof n[3].children === 'string') titles.push(n[3].children);
        if (n.src && /^\/thumbnails\//.test(n.src)) thumbnail = n.src;
      }, records);
      if (!titles.length) return;
      seen[match[1]] = true;
      results.push({season:season,id:+match[1],title:titles.join(' · '),headline:titles[0],description:titles.slice(1).join(' · '),thumbnail:thumbnail});
    }, records);
  });
  if (!results.length) throw new Error('No se encontraron episodios.');
  return results.sort(function(a,b){return a.id-b.id;});
}
function video(html) {
  var match = /"(?:videoUrl|src)":"(https:\/\/play\.shinchaneros\.tv\/[^"\s]+\.mp4)"/.exec(payloads(html));
  if (!match) throw new Error('Este episodio no tiene un enlace MP4 disponible.');
  return match[1];
}
function records(html) {
  var result={};payloads(html).split('\n').forEach(function(line){var colon=line.indexOf(':');try{result[line.slice(0,colon)]=JSON.parse(line.slice(colon+1));}catch(_) {}});return result;
}
function movies(html) {
  var data=records(html),result=[],seen={};
  Object.keys(data).forEach(function(k){walk(data[k],function(v){
    if(!Array.isArray(v)||!v[3]||typeof v[3].href!=='string')return;
    var match=/^\/movies\/([a-z0-9-]+)$/.exec(v[3].href);if(!match||seen[match[1]])return;
    var title='',poster='';walk(v[3].children,function(n){
      if(n.src&&/^\/posters\/[a-z0-9-]+\.webp$/.test(n.src))poster=n.src;
      if(Array.isArray(n)&&n[1]==='p'&&n[3]&&typeof n[3].children==='string')title=n[3].children;
    },data);
    if(!title||!poster)return;seen[match[1]]=true;
    result.push({kind:'movie',slug:match[1],title:title,headline:title,description:'',thumbnail:poster});
  },data);});
  if(!result.length)throw new Error('No se encontraron películas.');return result.reverse();
}
function item(season,id,titles,thumbnail) {
  if(!Number.isInteger(season)||season<1||!Number.isInteger(id)||id<1||!Array.isArray(titles)||!titles.length||!titles.every(function(t){return typeof t==='string';})||!/^\/thumbnails\/\d+x\d+\.webp$/.test(thumbnail))throw new Error('Datos de episodio inválidos.');
  return {season:season,id:id,title:titles.join(' · '),headline:titles[0],description:titles.slice(1).join(' · '),thumbnail:thumbnail};
}
function favorites(text) {
  var data=JSON.parse(text);if(!Array.isArray(data.ranking))throw new Error('El ranking no está disponible.');
  return data.ranking.map(function(e,i){var result=item(e.seasonId,e.episodeId,e.titles,e.thumbnail);
    if(!Number.isInteger(e.favoriteCount)||e.favoriteCount<0)throw new Error('Recuento de favoritos inválido.');
    result.rank=i+1;result.likes=e.favoriteCount;return result;
  });
}
function homeScript(html) {
  var text=payloads(html),component=/"Component":"\$([a-f0-9]+)"/.exec(text);
  var record=component&&new RegExp('(?:^|\\n)'+component[1]+':I(.*)').exec(text);
  if(!record)throw new Error('No se encuentran las colecciones de la portada.');
  var paths=JSON.parse(record[1])[1],path=paths[paths.length-1];
  if(!/^\/_next\/static\/chunks\/[a-zA-Z0-9._~-]+\.js$/.test(path))throw new Error('Ruta de catálogo inválida.');return path;
}
function collectionChunks(script) {
  var result={};['especiales','viajes','historias de miedo'].forEach(function(name,i){
    var module=new RegExp('\\.A\\((\\d+)\\)[\\s\\S]{0,160}message:"Cargando '+name+'\\.\\.\\."').exec(script);
    var chunk=module&&new RegExp(module[1]+',[a-z]=>\\{[a-z]\\.v\\([\\s\\S]{0,70}"(static/chunks/[a-zA-Z0-9._~-]+\\.js)"').exec(script);
    if(!chunk)throw new Error('La web ha cambiado la colección '+name+'.');result[['specials','travel','fear'][i]]='/_next/'+chunk[1];
  });return result;
}
function themed(script) {
  var result=[],seen={},re=/\{id:\d+,[^{}]*?thumbnail:"\/thumbnails\/\d+x\d+\.webp"\}/g,match;
  while((match=re.exec(script))){
    var object=match[0],id=+(/id:(\d+)/.exec(object)[1]),thumb=JSON.parse(/thumbnail:("(?:[^"\\]|\\.)*")/.exec(object)[1]);
    var season=+(thumb.match(/\/(\d+)x/)[1]),titles=JSON.parse(/titles:(\[(?:"(?:[^"\\]|\\.)*"(?:,)?)*\])/.exec(object)[1]);
    if(seen[season+'/'+id])continue;seen[season+'/'+id]=true;result.push(item(season,id,titles,thumb));
  }
  if(!result.length)throw new Error('Esta colección no contiene episodios.');return result;
}
function description(html) {
  var match=/"name":"description","content":("(?:[^"\\]|\\.)*")/.exec(payloads(html));return match?JSON.parse(match[1]):'';
}
module.exports = {seasons:seasons,episodes:episodes,video:video,movies:movies,favorites:favorites,homeScript:homeScript,collectionChunks:collectionChunks,themed:themed,description:description};
