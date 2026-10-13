(function(){
'use strict';
var $=function(id){return document.getElementById(id);}, video=$('video');
var base='',token='',bridge,seasons=[],episodes=[],current=null,season=1,focusedId=null,lastFocus=null,hideTimer,requests=0;
var shelves=[],activeRow=0,collectionStarted=false,descriptionCache={},wheelAt=0,rowDots=null;
var retry=function(){boot();},durationTimer,durationBusy=0,durationPending={},durationFailed={};
var state={last:null,positions:{},durations:{}};
try{var saved=JSON.parse(localStorage.getItem('shinchan-tv-v1'));if(saved&&saved.positions&&typeof saved.positions==='object')state=saved;}catch(_){}
if(!state.durations||typeof state.durations!=='object')state.durations={};
function persist(){try{localStorage.setItem('shinchan-tv-v1',JSON.stringify(state));}catch(_){$('storageWarning').hidden=false;$('storageWarning').textContent='No se puede guardar el progreso: el almacenamiento está lleno.';}refreshContinue();}
function key(e){return e.kind==='movie'?'movie/'+e.slug:e.season+'/'+e.id;}
function minutes(seconds){var value=Math.max(1,Math.round(seconds/60));return value+(value===1?' minuto':' minutos');}
function mediaDuration(e,seconds){var total=Math.max(1,Math.round(seconds/60));return e&&e.kind==='movie'?Math.floor(total/60)+' h '+(total%60)+' min':minutes(seconds);}
function updateProgress(bar,e){
  var duration=state.durations[key(e)],position=state.positions[key(e)]||0,percent=duration?Math.min(100,Math.max(0,position/duration*100)):0;
  bar.hidden=percent<=0;bar.querySelector('i').style.width=percent+'%';bar.setAttribute('aria-valuenow',Math.round(percent));
}
function time(t){t=Math.max(0,Math.floor(t||0));return Math.floor(t/60)+':'+('0'+t%60).slice(-2);}
var loadingAssets=['assets/shiro.png','assets/carga-shinchan.png','assets/carga-buriburizaemon.png','assets/carga-chocobi.png'];
var loadingIndex=0,loadingTimer=null;
var loadingPreloads=loadingAssets.map(function(src){var image=new Image();image.src=src;return image;});
function nextLoadingCharacter(){
  var image=$('loadingCharacter'),i;
  do{i=Math.floor(Math.random()*loadingAssets.length);}while(loadingAssets.length>1&&loadingAssets[i]===image.getAttribute('src'));
  image.src=loadingAssets[i];
  image.style.animation='none';void image.offsetWidth;image.style.animation='';
}
function loading(show){
  var wasVisible=!$('loader').hidden;$('loader').hidden=!show;
  if(!show){if(loadingTimer){clearInterval(loadingTimer);loadingTimer=null;}return;}
  if(wasVisible)return;
  nextLoadingCharacter();
}
function error(message,action){loading(false);$('errorText').textContent=message;retry=action||boot;$('error').hidden=false;$('retry').focus();}
function endpoint(path){return base+path+(path.indexOf('?')<0?'?':'&')+'token='+encodeURIComponent(token);}
function transport(done){
  if(typeof PalmServiceBridge==='undefined')return done(null);
  bridge=luna('start',function(data){if(!data.returnValue)return done(new Error(data.errorText||'El servicio no pudo arrancar.'));base=data.base;token=data.token;done(null);});
}
function api(path,done){
  transport(function(err){
    if(err)return done(err);
    var xhr=new XMLHttpRequest();xhr.open('GET',endpoint(path));xhr.timeout=25000;
    xhr.onload=function(){try{var value=JSON.parse(xhr.responseText);if(xhr.status!==200)throw new Error(value.error||'No se pudo cargar.');done(null,value);}catch(e){done(e);}};
    xhr.onerror=function(){done(new Error('No se puede conectar con el servicio de la TV.'));};
    xhr.ontimeout=function(){done(new Error('La conexión tarda demasiado. Comprueba Internet.'));};xhr.send();
  });
}
function luna(method,done){
  var b=new PalmServiceBridge();b.onservicecallback=function(text){try{done(JSON.parse(text));}catch(_){done({returnValue:false,errorText:'Respuesta del servicio inválida.'});}};
  b.call('luna://com.shinchaneros.tv.service/'+method,'{}');return b;
}
function button(label,fn){var b=document.createElement('button');b.textContent=label;b.onclick=fn;return b;}
var svgNS='http://www.w3.org/2000/svg',shapeCache={};
var shapeObserver=typeof ResizeObserver!=='undefined'?new ResizeObserver(function(entries){entries.forEach(function(entry){updateShape(entry.target);});}):null;
function updateShape(b){
  var size=getComputedStyle(b),w=parseFloat(size.width),h=parseFloat(size.height),capsule=b.dataset.cornerRadius==='capsule',r=capsule?Math.min(w,h)/2:+b.dataset.cornerRadius,exponent=capsule?2:4;
  if(!w||!h)return;
  var shapeKey=[w,h,r,exponent].join('-').replace(/\./g,'_'),id='squircle-'+shapeKey;
  if(!shapeCache[shapeKey]){
    var clip=document.createElementNS(svgNS,'clipPath'),outline=document.createElementNS(svgNS,'path');
    clip.id=id;clip.setAttribute('clipPathUnits','userSpaceOnUse');outline.setAttribute('d',Squircle.path(w,h,r,0,exponent));clip.appendChild(outline);$('shapeDefinitions').appendChild(clip);shapeCache[shapeKey]=true;
  }
  b.querySelector('.shape-surface').style.clipPath='url(#'+id+')';
}
function shapeButton(b,r){b.dataset.cornerRadius=r;if(shapeObserver)shapeObserver.observe(b);updateShape(b);}
function releaseShapes(container){if(shapeObserver)Array.prototype.forEach.call(container.querySelectorAll('button'),function(b){shapeObserver.unobserve(b);});}
function playbackIcon(){var paused=video.paused;$('playGlyph').toggleAttribute('hidden',!paused);$('pauseGlyph').toggleAttribute('hidden',paused);$('toggle').setAttribute('aria-label',paused?'Reanudar':'Pausar');}

function scrollToItem(row,left){
  row.scrollTo({left:Math.max(0,left-88),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function showSeasons(){
  var nav=$('seasons');releaseShapes(nav);nav.textContent='';
  seasons.forEach(function(s){var b=button('Temporada '+s,function(){loadSeason(s);});b.dataset.season=s;b.onfocus=function(){scrollToItem(nav,b.offsetLeft);};b.className=s===season?'selected':'';var surface=document.createElement('span');surface.className='season-surface shape-surface';surface.textContent=b.textContent;b.textContent='';b.appendChild(surface);nav.appendChild(b);shapeButton(b,'capsule');});
}
function label(e){return (e.kind==='movie'?'':e.id+'. ')+(e.headline||e.title.split(' · ')[0]);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function titleHTML(e){var t=e.headline||e.title.split(' · ')[0];if(e.kind==='movie')return esc(t);return '<span class="title-badge">'+esc(String(e.id))+'</span>'+esc(t);}
function descHTML(e){var d=descriptionCache[key(e)]||e.description||'',y=null;
  if(e.kind==='movie'){if(TMDB.movies[e.slug]){if(TMDB.movies[e.slug].sinopsis)d=TMDB.movies[e.slug].sinopsis;if(TMDB.movies[e.slug].fecha)y=TMDB.movies[e.slug].fecha.slice(0,4);}}
  else{var tm=TMDB.episodes[key(e)];if(tm&&tm.f)y=String(tm.f).slice(0,4);}
  return esc(d)+(y?' · <b>'+esc(y)+'</b>':'');}
function describe(e){
  if(activeRow===0)focusedId=e.id;
  $('episodeTitle').innerHTML=titleHTML(e);
  $('episodeDescription').innerHTML=descHTML(e);
  if(e.kind==='movie')updateProgress($('movieProgress'),e);else $('movieProgress').hidden=true;
}
function focusCard(row,index){
  var shelf=shelves[row];if(!shelf)return;
  var cards=shelf.carousel.querySelectorAll('button');
  if(cards.length)cards[Math.max(0,Math.min(index||0,cards.length-1))].focus({preventScroll:true});
}
function focusEpisode(id){var at=episodes.findIndex(function(e){return e.id===id;});focusCard(0,Math.max(0,at));}
function alignRow(row){
  if(row===activeRow&&shelves[row].element.classList.contains('active'))return;
  activeRow=row;
  shelves.forEach(function(s,i){s.element.classList.toggle('active',i===row);});
  if(rowDots)rowDots.forEach(function(d,i){d.classList.toggle('on',i===row);});
  var shelf=shelves[row];shelf.element.appendChild(document.querySelector('.details'));
  var rel=shelf.carousel.getBoundingClientRect().top-$('shelves').getBoundingClientRect().top;
  var offset=row===0?0:Math.max(0,rel-242);
  $('shelves').style.transform='translateY('+(-offset)+'px)';
}
function cardDuration(e){
  Array.prototype.forEach.call(document.querySelectorAll('.episode'),function(card){
    if(card.dataset.key!==key(e))return;
    var bar=card.querySelector('.watch-progress');if(bar){updateProgress(bar,e);card.classList.toggle('has-progress',!bar.hidden);}
    if(card.dataset.likes==='true')return;
    var seconds=state.durations[key(e)],badge=card.querySelector('.duration');
    badge.textContent=seconds?mediaDuration(e,seconds):'—';badge.title=seconds?'Duración':'Duración pendiente';
    var position=state.positions[key(e)];
    card.setAttribute('aria-label',label(e)+(seconds?'. Duración '+mediaDuration(e,seconds):'')+(position?'. Continuar desde '+time(position):''));
  });
}
function scheduleDurations(){clearTimeout(durationTimer);durationTimer=setTimeout(loadDurations,120);}
function loadDurations(){
  if(current||$('menu').hidden||!shelves[activeRow]||shelves[activeRow].id==='favorites')return;
  var shelf=shelves[activeRow],row=shelf.carousel,cards=row.querySelectorAll('.episode'),rect=row.getBoundingClientRect();
  var candidates=shelf.items.filter(function(e,i){
    var k=key(e);
    if(durationPending[k]||durationFailed[k]||(state.durations[k]&&(e.kind!=='movie'||Object.prototype.hasOwnProperty.call(descriptionCache,k))))return false;
    var card=cards[i];if(!card)return false;
    var r=card.getBoundingClientRect();
    return r.right>rect.left&&r.left<rect.right;
  });
  candidates.sort(function(a,b){return (b===shelf.items[shelf.index]?1:0)-(a===shelf.items[shelf.index]?1:0);});
  while(durationBusy<2&&candidates.length){
    (function(e){var k=key(e);durationPending[k]=true;durationBusy++;
      api('/duration/'+k,function(err,data){
        durationBusy--;delete durationPending[k];
        if(!err&&isFinite(data.seconds)&&data.seconds>0&&data.seconds<86400){
          state.durations[k]=data.seconds;descriptionCache[k]=data.description||'';persist();cardDuration(e);
          var selected=shelves[activeRow];if(selected&&selected.items[selected.index]===e)describe(e);
        }else durationFailed[k]=true;
        loadDurations();
      });
    })(candidates.shift());
  }
}
function drawShelf(shelf){
  var row=shelf.carousel;releaseShapes(row);row.textContent='';
  var RANK_PEEK={'1':70,'2':103,'3':103,'4':103,'5':90,'6':103,'7':103,'8':103,'9':103};
  shelf.items.forEach(function(e,i){
    var b=button('',function(){shuffleQueue=[];play(e);});b.className='episode'+(e.kind==='movie'?' poster':'');b.dataset.key=key(e);b.dataset.index=i;b.dataset.row=shelves.indexOf(shelf);b.dataset.episode=e.id||'';
    b.setAttribute('aria-label',label(e));
    if(shelf.id==='favorites'){
      var wrapper=document.createElement('div');wrapper.className='ranked-card'+(e.rank>9?' double-rank':'');
      var rank=document.createElement('span');rank.className='rank';rank.textContent=e.rank;rank.setAttribute('aria-hidden','true');if(RANK_PEEK[e.rank]!=null)wrapper.style.paddingLeft=RANK_PEEK[e.rank]+'px';wrapper.appendChild(rank);wrapper.appendChild(b);row.appendChild(wrapper);b.dataset.likes='true';
      b.setAttribute('aria-label',e.rank+'. '+label(e)+'. '+e.likes+' likes');
    }else row.appendChild(b);
    var surface=document.createElement('div');surface.className='card-surface shape-surface';b.appendChild(surface);
    var img=document.createElement('img');img.alt='';img.loading='lazy';img.onerror=function(){if(this.dataset.tmdb){delete this.dataset.tmdb;this.src='https://shinchaneros.tv'+e.thumbnail;}else this.style.visibility='hidden';};
    if(e.kind==='movie'&&TMDB.movies[e.slug]&&TMDB.movies[e.slug].poster){img.dataset.tmdb='1';img.src='https://image.tmdb.org/t/p/w342'+TMDB.movies[e.slug].poster;}else img.src='https://shinchaneros.tv'+e.thumbnail;surface.appendChild(img);
    var badge=document.createElement('span');badge.className='badge duration';badge.textContent=shelf.id==='favorites'?'♥ '+e.likes:'—';surface.appendChild(badge);
    if(e.kind!=='movie'){var bar=document.createElement('div');bar.className='watch-progress';bar.setAttribute('role','progressbar');bar.setAttribute('aria-label','Progreso guardado');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');bar.appendChild(document.createElement('i'));surface.appendChild(bar);}
    b.onfocus=function(){
      shelf.index=i;alignRow(shelves.indexOf(shelf));describe(e);
      var left=(b.parentElement.classList.contains('ranked-card')?b.parentElement:b).offsetLeft;
      scrollToItem(row,left);scheduleDurations();
    };
    shapeButton(b,e.kind==='movie'?32:48);cardDuration(e);
  });
  row.onscroll=scheduleDurations;
}
function draw(){shelves[0].items=episodes;drawShelf(shelves[0]);}
function loadCollection(shelf){
  api('/collection/'+shelf.id,function(err,data){
    if(err){
      shelf.carousel.textContent='';var b=button('No se pudo cargar. Reintentar',function(){loadCollection(shelf);});b.className='collection-retry';b.dataset.row=shelves.indexOf(shelf);b.onfocus=function(){alignRow(+b.dataset.row);$('episodeTitle').textContent=shelf.title;$('episodeDescription').textContent=err.message;$('movieProgress').hidden=true;};shelf.carousel.appendChild(b);return;
    }
    var hadFocus=shelf.carousel.contains(document.activeElement);shelf.items=data;drawShelf(shelf);if(hadFocus)focusCard(shelves.indexOf(shelf),shelf.index);
  });
}
function initShelves(){
  shelves=[{id:'episodes',title:'Todos los episodios',items:[],index:0,element:$('shelf-episodes'),carousel:$('episodes')}];
  [['movies','Películas'],['favorites','Favoritos'],['specials','Especiales'],['travel','Viajes en familia'],['fear','Historias de miedo']].forEach(function(pair){
    var element=document.createElement('section');element.className='shelf';element.id='shelf-'+pair[0];
    var heading=document.createElement('h2');heading.className='shelf-title';heading.textContent=pair[1];element.appendChild(heading);
    var carousel=document.createElement('div');carousel.className='carousel'+(pair[0]==='movies'?' poster-carousel':'');carousel.setAttribute('aria-label',pair[1]);element.appendChild(carousel);$('shelves').appendChild(element);
    shelves.push({id:pair[0],title:pair[1],items:[],index:0,element:element,carousel:carousel});
  });
  rowDots=[];var nav=$('rowDots');shelves.forEach(function(){var d=document.createElement('span');d.className='row-dot';nav.appendChild(d);rowDots.push(d);});
  $('continueBtn').onclick=function(){if(state.last){shuffleQueue=[];play(state.last);}};
  refreshContinue();
  paintSleep();
  Array.prototype.forEach.call(document.querySelectorAll('.shelf-title'),paintTitleWords);
  alignRow(0);
}
var TITLE_COLORS=['#ffd6e0','#bde0ff','#fff3a6','#c9f2c7','#e3d4ff','#ffd9ae','#ffc9c2'];
function paintTitleWords(el){var words=el.textContent.split(' ');el.textContent='';words.forEach(function(w,i){if(i)el.appendChild(document.createTextNode(' '));var s=document.createElement('span');s.style.color=TITLE_COLORS[i%TITLE_COLORS.length];s.textContent=w;el.appendChild(s);});}
function refreshContinue(){var b=$('continueBtn');if(!b)return;var last=state&&state.last,t=last&&(last.headline||(last.title||'').split(' · ')[0]);b.hidden=!last;$('continueBtn').setAttribute('aria-label',last?('Seguir viendo'+(t?': '+t:'')):'Seguir viendo');}
var DORMIR_LS='shinchan-dormir';
function dormirSaved(){try{return JSON.parse(localStorage.getItem(DORMIR_LS));}catch(_){return null;}}
function paintSleep(){var on=!!(dormirSaved()&&dormirSaved().on);['sleep','sleepHeader'].forEach(function(id){var b=$(id);if(!b)return;b.classList.toggle('on',on);b.setAttribute('aria-label',on?'Dormir activado: imagen Expert 2, brillo 25, volumen 5 y apagado en 2 horas. Pulsa para desactivar y volver a Vivid.':'Dormir: brillo bajo, volumen 5 y apagado en 2 horas');});}
function moveRow(delta){
  var row=activeRow+delta;
  while(row>=0&&row<shelves.length){if(shelves[row].carousel.querySelector('button'))return focusCard(row,shelves[row].index);row+=delta;}
}
function loadSeason(s,done){
  var request=++requests;season=s;focusedId=null;showSeasons();loading(true);
  api('/episodes/'+s,function(err,data){
    if(request!==requests)return;
    if(err)return error(err.message,function(){loadSeason(s,done);});
    episodes=data;draw();
    if(done)done();else focusEpisode(episodes[0].id);
    loading(false);
    loadDurations();
  });
}
function save(){if(!current||!isFinite(video.currentTime)||!video.duration)return;state.last=current;state.positions[key(current)]=video.currentTime;persist();}
function controls(){clearTimeout(hideTimer);$('controls').classList.remove('quiet');if(!video.paused)hideTimer=setTimeout(function(){$('controls').classList.add('quiet');},4500);}
function play(e){
  if(!current)lastFocus={row:activeRow,index:shelves[activeRow].index};
  current=e;state.last=e;persist();$('error').hidden=true;$('menu').hidden=true;$('player').hidden=false;refreshNextCard();
  var parts=e.title.split(' · ');$('playingTitle').innerHTML=titleHTML(e);$('playingDescription').innerHTML=descHTML(e);loading(true);
  var chosen=key(e);
  api('/resolve/'+chosen,function(err,data){
    if(!current||key(current)!==chosen)return;
    if(err)return error(err.message,function(){play(e);});
    video.src=endpoint(data.url);video.load();var promise=video.play();
    if(promise&&promise.catch)promise.catch(function(){loading(false);controls();});controls();$('toggle').focus();
  });
}
function peekNext(){if(shuffleQueue.length)return shuffleQueue[0];if(!current)return null;var previous=current;
  function same(a,b){return key(a)===key(b);}
  if(lastFocus&&lastFocus.row>0){var shelf=shelves[lastFocus.row];if(shelf){var at=shelf.items.findIndex(function(e){return same(e,previous);});if(at>=0&&shelf.items[at+1])return shelf.items[at+1];}return null;}
  var at2=episodes.findIndex(function(e){return same(e,previous);});
  if(at2>=0&&episodes[at2+1])return episodes[at2+1];return null;}
function refreshNextCard(){var card=$('nextCard');if(!card)return;var n=peekNext();
  if(!n||!n.thumbnail){card.hidden=true;return;}
  card.hidden=false;
  $('nextImg').src='https://shinchaneros.tv'+n.thumbnail;
  $('nextImg').alt='';
  $('nextTitle').textContent=n.headline||(n.title||'').split(' · ')[0];}
function back(){
  var previous=current;save();shuffleQueue=[];if(previous&&lastFocus){var at=shelves[lastFocus.row].items.findIndex(function(e){return key(e)===key(previous);});if(at>=0)lastFocus.index=at;}current=null;video.pause();video.removeAttribute('src');video.load();loading(false);
  $('error').hidden=true;$('player').hidden=true;$('menu').hidden=false;clearTimeout(hideTimer);
  if(previous)cardDuration(previous);
  var target=lastFocus||{row:0,index:0};focusCard(target.row,target.index);loadDurations();
}
function toggle(){
  if(!current)return;
  if(video.paused){
    var oldToken=token;
    transport(function(err){
      if(err)return error(err.message,toggle);if(oldToken!==token)return play(current);
      var p=video.play();if(p&&p.catch)p.catch(function(e){error('No se pudo reanudar: '+e.message,function(){play(current);});});
    });
  }else video.pause();controls();
}
function next(){
  if(!current)return;save();shuffleQueue=[];var previous=current;
  if(lastFocus&&lastFocus.row>0){var shelf=shelves[lastFocus.row],at=shelf.items.findIndex(function(e){return key(e)===key(previous);});if(shelf.items[at+1]){lastFocus.index=at+1;return play(shelf.items[at+1]);}return back();}
  function choose(){
    var at=episodes.findIndex(function(e){return key(e)===key(previous);});
    if(at>=0&&episodes[at+1])return play(episodes[at+1]);
    var index=seasons.indexOf(previous.season);
    if(index>=0&&seasons[index+1])loadSeason(seasons[index+1],function(){play(episodes[0]);});else back();
  }
  if(season!==previous.season)loadSeason(previous.season,choose);else choose();
}
video.addEventListener('loadedmetadata',function(){
  var pos=current&&state.positions[key(current)];if(pos&&pos<video.duration-8)video.currentTime=pos;
  if(current&&isFinite(video.duration)&&video.duration>0){state.durations[key(current)]=video.duration;persist();}
});
['waiting','stalled'].forEach(function(event){video.addEventListener(event,function(){if(current&&!video.paused&&video.readyState<3)loading(true);});});
video.addEventListener('playing',function(){loading(false);playbackIcon();controls();});
video.addEventListener('pause',function(){loading(false);save();playbackIcon();controls();});
video.addEventListener('error',function(){if(current)error('El vídeo no se puede reproducir (código '+(video.error?video.error.code:'?')+'). Puedes reintentarlo o elegir otro episodio.',function(){play(current);});});
video.addEventListener('ended',function(){if(!shuffleQueue.length&&shufflePool.length)refillShuffle();if(shuffleQueue.length)return play(shuffleQueue.shift());next();});
video.addEventListener('timeupdate',function(){
  if(current&&!video.paused&&video.readyState>=3)loading(false);
  paintTimeline();
});
video.addEventListener('progress',function(){paintBuffer();});
var scrubAt=0,scrubStep=15;
function scrub(dir){
  if(!current||!isFinite(video.duration)||!video.duration)return;
  var now=Date.now();
  scrubStep=(now-scrubAt<800)?Math.min(300,scrubStep*2):15;
  scrubAt=now;
  video.currentTime=Math.max(0,Math.min(video.duration,video.currentTime+dir*scrubStep));
  paintTimeline();controls();
}
function paintBuffer(){try{var b=$('buffered');if(!b)return;var d=video.duration||0,buf=video.buffered;if(buf&&buf.length&&d)b.style.width=(buf.end(buf.length-1)/d*100)+'%';else b.style.width='0';}catch(_){}}
function paintTimeline(){var d=video.duration||0,c=video.currentTime||0,p=d?c/d*100:0;
  $('elapsed').textContent=time(c);
  $('duration').textContent=isFinite(d)&&d>0?'-'+time(d-c):'—';
  $('progress').style.width=p+'%';var th=$('thumb');if(th)th.style.left=p+'%';
  paintBuffer();
  document.querySelector('.progress').setAttribute('aria-valuenow',Math.round(p));}
setInterval(save,5000);setInterval(function(){if(typeof PalmServiceBridge!=='undefined'&&base)luna('ping',function(){});},30000);
window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',function(){if(document.hidden){save();video.pause();}});
$('toggle').onclick=toggle;$('back').onclick=back;$('next').onclick=next;
function hbExec(cmd,done){try{var b=new PalmServiceBridge();var timer=setTimeout(function(){done(null);},25000);b.onservicecallback=function(t){clearTimeout(timer);try{var v=JSON.parse(t);done(v.returnValue===false?null:(v.stdoutString||''));}catch(e){done(null);}};b.call('luna://org.webosbrew.hbchannel.service/exec',JSON.stringify({command:cmd}));}catch(e){done(null);}}
function directVolume(done){try{var b=new PalmServiceBridge();var timer=setTimeout(function(){done(false);},8000);b.onservicecallback=function(t){clearTimeout(timer);try{done(JSON.parse(t).returnValue===true);}catch(e){done(false);}};b.call('luna://com.webos.audio/setVolume',JSON.stringify({volume:5}));}catch(e){done(false);}}
function dormirToggle(btn){loading(true);
  var saved=dormirSaved(),turningOff=!!(saved&&saved.on);
  function finish(ok,msg){loading(false);if(!ok)return error(msg,function(){if(btn&&!btn.hidden)btn.focus();});paintSleep();if(current)controls();if(btn&&!btn.hidden)btn.focus();}
  if(turningOff){
    hbExec("luna-send -n 1 -w 8000 -f luna://com.webos.settingsservice/setSystemSettings '{\"category\":\"picture\",\"settings\":{\"pictureMode\":\"vivid\"}}'|grep -q 'returnValue.: true'&&echo MODE-OK;"
      +"luna-send -n 1 -w 8000 -f luna://com.webos.settingsservice/setSystemSettings '{\"category\":\"picture\",\"settings\":{\"backlight\":100}}'|grep -q 'returnValue.: true'&&echo PIC-OK;"
      +"luna-send -n 1 -w 8000 -f luna://com.webos.service.tvReservationAgent/timer/sleep/add '{\"sleepTimeMinute\":\"0\"}'|grep -q 'returnValue.: true'&&echo TIMER-OK",function(out){
      if(out&&/MODE-OK/.test(out)&&/PIC-OK/.test(out)&&/TIMER-OK/.test(out)){try{localStorage.removeItem(DORMIR_LS);}catch(_){}return finish(true);}
      return finish(false,'No se pudo desactivar el modo dormir.');
    });
    return;
  }
  hbExec("luna-send -n 1 -w 8000 -f luna://com.webos.settingsservice/setSystemSettings '{\"category\":\"picture\",\"settings\":{\"pictureMode\":\"expert2\"}}'|grep -q 'returnValue.: true'&&echo MODE-OK;"
    +"luna-send -n 1 -w 8000 -f luna://com.webos.settingsservice/setSystemSettings '{\"category\":\"picture\",\"settings\":{\"backlight\":25}}'|grep -q 'returnValue.: true'&&echo PIC-OK;"
    +"luna-send -n 1 -w 8000 -f luna://com.webos.audio/setVolume '{\"volume\":5}'|grep -q 'returnValue.: true'&&echo VOL-OK;"
    +"luna-send -n 1 -w 8000 -f luna://com.webos.service.tvReservationAgent/timer/sleep/add '{\"sleepTimeMinute\":\"120\"}'|grep -q 'returnValue.: true'&&echo TIMER-OK",function(out){
    if(out&&/MODE-OK/.test(out)&&/PIC-OK/.test(out)&&/VOL-OK/.test(out)&&/TIMER-OK/.test(out)){try{localStorage.setItem(DORMIR_LS,JSON.stringify({on:true}));}catch(_){}return finish(true);}
    directVolume(function(ok){if(ok)return finish(false,'Dormir parcial: volumen a 5, pero imagen y temporizador no aplicados.');return finish(false,'No se pudo activar el modo dormir.');});
  });
}
$('sleep').onclick=function(){dormirToggle($('sleep'));};
$('sleepHeader').onclick=function(){dormirToggle($('sleepHeader'));};
var shuffleQueue=[],shufflePool=[];
function refillShuffle(){shuffleQueue=[];var copy=shufflePool.slice();while(copy.length&&shuffleQueue.length<20){shuffleQueue.push(copy.splice(Math.floor(Math.random()*copy.length),1)[0]);}}
$('shuffleBtn').onclick=function(){
  var pool=[],seen={};
  function add(list){(list||[]).forEach(function(e){if(!e||e.kind==='movie'||!e.title)return;var k;try{k=key(e);}catch(_){return;}if(seen[k])return;seen[k]=1;pool.push(e);});}
  add(episodes);shelves.slice(1).forEach(function(s){add(s.items);});
  if(pool.length<2)return error('Aún no hay suficientes episodios cargados para aleatorio.',function(){var b=$('shuffleBtn');if(b&&!b.hidden)b.focus();});
  shufflePool=pool;refillShuffle();play(shuffleQueue.shift());
};
$('rewind').onclick=function(){video.currentTime=Math.max(0,video.currentTime-30);controls();};
$('forward').onclick=function(){video.currentTime=Math.min(video.duration||0,video.currentTime+30);controls();};
$('retry').onclick=function(){$('error').hidden=true;retry();};
$('dismiss').onclick=function(){if(current)back();else{$('error').hidden=true;focusEpisode(focusedId);}};
function navigate(code){
  var active=document.activeElement;
  if(!$('error').hidden||current){
    if(current&&$('error').hidden&&(code===38||code===40)){scrub(code===38?1:-1);return;}
    var scope=!$('error').hidden?$('error'):$('controls'),buttons=Array.prototype.slice.call(scope.querySelectorAll('button'));
    var index=buttons.indexOf(active),step=code===37?-1:code===39?1:0;
    if(step&&buttons[index+step])buttons[index+step].focus();return;
  }
  if(active.dataset.row!==undefined){
    var row=+active.dataset.row,at=+active.dataset.index||0;
    if(code===37)focusCard(row,at-1);
    else if(code===39)focusCard(row,at+1);
    else if(code===40)moveRow(1);
    else if(code===38){
      if(row>0)moveRow(-1);
      else{var selected=$('seasons').querySelector('.selected');if(selected)selected.focus({preventScroll:true});}
    }
  }else if(active.id==='continueBtn'||active.id==='sleepHeader'||active.id==='shuffleBtn'){
    var order=[$('sleepHeader'),$('continueBtn'),$('shuffleBtn')].filter(function(b){return b&&!b.hidden;});
    var pos=order.indexOf(active);
    if(code===40){var sel2=$('seasons').querySelector('.selected')||$('seasons').querySelector('button');if(sel2)sel2.focus({preventScroll:true});}
    else if(code===38){/* arriba: quedarse */}
    else{var dh=code===37?-1:code===39?1:0;if(dh&&order[pos+dh])order[pos+dh].focus();}
  }else if(active.dataset.season){
    if(code===38){var c=$('continueBtn');if(c&&!c.hidden){c.focus();return;}var h=$('sleepHeader');if(h){h.focus();return;}}
    var tabs=Array.prototype.slice.call($('seasons').querySelectorAll('button')),tab=tabs.indexOf(active),delta=code===37?-1:code===39?1:0;
    if(code===40)focusEpisode(focusedId);
    else if(delta&&tabs[tab+delta]){tabs[tab+delta].focus({preventScroll:true});}
  }else focusEpisode(focusedId);
}
document.addEventListener('keydown',function(e){
  var code=e.keyCode;
  if(code===461||code===27){e.preventDefault();if(!$('error').hidden)$('dismiss').click();else if(current)back();else if(window.webOSSystem&&window.webOSSystem.close)window.webOSSystem.close();return;}
  if(code===415||code===19||code===179||code===32){
    e.preventDefault();
    if(current){if(code===415&&video.paused)toggle();else if(code===19&&!video.paused)toggle();else if(code===179||code===32)toggle();}
    else if(code===415&&$('error').hidden){var chosen=shelves[activeRow].items[shelves[activeRow].index];if(chosen)play(chosen);}
    return;
  }
  if(code>=37&&code<=40){e.preventDefault();if(current&&$('controls').classList.contains('quiet')){controls();$('toggle').focus();return;}navigate(code);}
  if(current)controls();
});
$('player').addEventListener('mousemove',controls);
$('menu').addEventListener('wheel',function(e){if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&Date.now()-wheelAt>280){e.preventDefault();wheelAt=Date.now();moveRow(e.deltaY>0?1:-1);}},{passive:false});
initShelves();
var PASTEL_SETS=[{light:'#ffd6e0',surface:'#2b2129',bg:'#100d11'},{light:'#bde0ff',surface:'#1e2433',bg:'#0b0e15'},{light:'#fff3a6',surface:'#2c2718',bg:'#100e08'},{light:'#c9f2c7',surface:'#1e2b21',bg:'#0a100c'},{light:'#e3d4ff',surface:'#262033',bg:'#0e0b15'},{light:'#ffd9ae',surface:'#2d241a',bg:'#100c08'},{light:'#ffc9c2',surface:'#2b2129',bg:'#100d11'}];
function pickPastel(){var last=null;try{last=+localStorage.getItem('shinchan-pastel');}catch(_){}var i;do{i=Math.floor(Math.random()*PASTEL_SETS.length);}while(PASTEL_SETS.length>1&&i===last);try{localStorage.setItem('shinchan-pastel',i);}catch(_){}return PASTEL_SETS[i];}
var PASTEL=pickPastel();
try{var _rs=document.documentElement.style;_rs.setProperty('--p-light',PASTEL.light);_rs.setProperty('--p-surface',PASTEL.surface);_rs.setProperty('--p-bg',PASTEL.bg);}catch(_){}
var TMDB={movies:{},episodes:{}};
try{var xhr0=new XMLHttpRequest();xhr0.open('GET','assets/tmdb.json',false);xhr0.send();if(xhr0.status===200)TMDB=JSON.parse(xhr0.responseText);}catch(_){TMDB={movies:{},episodes:{}};}
function boot(){
  loading(true);
  function ready(data){
    if(!data.returnValue)return error(data.errorText||'El servicio no pudo arrancar.',boot);base=data.base;token=data.token;
    api('/seasons',function(err,data){
      if(err)return error(err.message,boot);seasons=data;
      if(!collectionStarted){collectionStarted=true;shelves.slice(1).forEach(loadCollection);}
      season=seasons[0];
      loadSeason(season);
    });
  }
  if(typeof PalmServiceBridge!=='undefined')bridge=luna('start',ready);
  else{var params=new URLSearchParams(location.search);ready({returnValue:true,base:params.get('base')||'http://127.0.0.1:18766',token:params.get('token')||''});}
}
nextLoadingCharacter();boot();
})();
