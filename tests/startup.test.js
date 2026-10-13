const assert=require('node:assert'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../app/app.js'),'utf8');
const html=fs.readFileSync(require.resolve('../app/index.html'),'utf8');
const loader=html.match(/<div\s+id="loader"[^>]*>/)[0];
assert(!/\bhidden\b/.test(loader),'The loader must be visible before JavaScript starts');
const part=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a);return source.slice(a,b);};

for(const last of [{season:3,id:15},{kind:'movie',slug:'saved-movie'}]){
 const state={last,positions:{'3/15':240,'movie/saved-movie':600}},saved=JSON.stringify(state),events=[],pending=[];
 const context={state,seasons:[],season:3,episodes:[],focusedId:null,requests:0,collectionStarted:false,
  shelves:[{},{id:'movies',carousel:{contains:()=>false}}],document:{activeElement:{}},
  loading:show=>events.push(show?'loader-on':'loader-off'),
  luna:(method,done)=>done({returnValue:true,base:'test',token:'test'}),PalmServiceBridge:function(){},
  api:(path,done)=>path==='/seasons'?done(null,[1,2,3]):pending.push({path,done}),
  showSeasons(){},draw:()=>events.push('draw'),drawShelf(){},loadDurations(){},
  focusEpisode:id=>events.push('focus-'+id),focusCard:()=>events.push('collection-focus'),
  error:message=>events.push('error-'+message)};
 vm.createContext(context);
 vm.runInContext(part('function loadCollection(shelf){','function initShelves(){'),context);
 vm.runInContext(part('function loadSeason(s,done){','function save(){'),context);
 vm.runInContext(part('function boot(){','nextLoadingCharacter();boot();'),context);
 context.boot();
 assert.equal(context.season,1);
 const episodeRequest=pending.find(r=>r.path==='/episodes/1');assert(episodeRequest);
 assert(!events.includes('loader-off'));
 episodeRequest.done(null,[{season:1,id:1},{season:1,id:2}]);
 assert.deepEqual(events.slice(-3),['draw','focus-1','loader-off']);
 pending.find(r=>r.path==='/collection/movies').done(null,[{kind:'movie',slug:'saved-movie'}]);
 assert(!events.includes('collection-focus'),'A late movie response must not steal startup focus');
 assert.equal(JSON.stringify(state),saved,'Startup must preserve saved playback progress');
 context.loadSeason(2);context.loadSeason(3);
 pending.find(r=>r.path==='/episodes/2').done(null,[{season:2,id:1}]);
 assert.equal(events.at(-1),'loader-on','A stale season response must not hide the loader');
 pending.find(r=>r.path==='/episodes/3').done(new Error('offline'));
 assert.equal(events.at(-1),'error-offline');
}
console.log('OK: loader visible without JS, T1/E1 initial focus, saved progress retained, late collections and stale requests cannot steal focus or dismiss loading.');
