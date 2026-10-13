const assert=require('node:assert'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../app/app.js'),'utf8');
const part=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a);return source.slice(a,b);};
const first={season:1,id:1},second={season:1,id:2},random={season:9,id:378},played=[],events={},elements={};
const context={current:first,season:1,seasons:[1,2],episodes:[first,second],state:{last:first},e:first,
 shuffleQueue:[random],shufflePool:[random],lastFocus:{row:0,index:0},
 shelves:[{items:[first,second],index:0},{items:[random],index:0}],
 key:e=>e.season+'/'+e.id,save(){},persist(){},cardDuration(){},focusCard(){},loadDurations(){},loading(){},
 clearTimeout(){},hideTimer:0,play:e=>{played.push(e);context.current=e;},
 video:{pause(){},removeAttribute(){},load(){},addEventListener:(name,fn)=>events[name]=fn},
 $:id=>elements[id]||(elements[id]={hidden:false}),Math};
vm.createContext(context);
vm.runInContext(part('function back(){','function toggle(){'),context);
vm.runInContext(part('function next(){',"video.addEventListener('loadedmetadata'"),context);
vm.runInContext(part('function refillShuffle(){',"$('shuffleBtn').onclick"),context);
vm.runInContext(part("video.addEventListener('ended'", "video.addEventListener('timeupdate'"),context);
function randomMode(){context.current=first;context.lastFocus={row:0,index:0};context.shuffleQueue=[random];context.shufflePool=[random];played.length=0;}
function canceled(){assert.equal(context.shuffleQueue.length,0);assert.equal(context.shufflePool.length,0);context.current=first;events.ended();assert.equal(played.at(-1),second,'Normal playback must advance sequentially after leaving shuffle');}
randomMode();context.back();canceled();
randomMode();context.next();assert.equal(played[0],second);canceled();
const cardHandler=part("var b=button('',function(){",');b.className').slice("var b=button('',".length);
randomMode();vm.runInContext('('+cardHandler+')()',context);canceled();
randomMode();vm.runInContext(part("$('continueBtn').onclick=",'  refreshContinue();'),context);elements.continueBtn.onclick();canceled();
randomMode();events.ended();assert.equal(played.at(-1),random,'Active shuffle must advance within its queue');
context.shuffleQueue=[];played.length=0;events.ended();assert.equal(played.at(-1),random,'An exhausted active shuffle must refill');
context.shufflePool=Array.from({length:40},(_,i)=>({season:1,id:i+1}));context.refillShuffle();
assert.equal(context.shuffleQueue.length,20);assert.equal(new Set(context.shuffleQueue.map(context.key)).size,20);
context.current=second;context.lastFocus={row:0,index:1};context.shufflePool=[];context.shuffleQueue=[];
context.loadSeason=(season,done)=>{assert.equal(season,2);context.episodes=[{season:2,id:34}];done();};
context.next();assert.equal(played.at(-1).season,2);assert.equal(played.at(-1).id,34);
context.current=random;context.lastFocus={row:1,index:0};context.next();assert.equal(context.current,null,'The last title in a collection returns to the menu');
context.episodes=[first,second];context.current=first;context.lastFocus={row:1,index:0};context.next();assert.equal(played.at(-1),second,'An episode absent from the remembered collection must advance sequentially');
const movie={kind:'movie',slug:'first'},playContext={...context,current:null,activeRow:0,
 shelves:[{items:[first],index:0},{items:[movie],index:0}],
 key:e=>e.kind==='movie'?'movie/'+e.slug:e.season+'/'+e.id,
 refreshNextCard(){},titleHTML(){return '';},descHTML(){return '';},api(){}};
vm.createContext(playContext);vm.runInContext(part('function play(e){','function peekNext(){'),playContext);
playContext.play(movie);assert.equal(playContext.lastFocus.row,1,'A resumed movie must use its movie collection even after startup at T1');
playContext.current=null;playContext.activeRow=1;playContext.play(first);assert.equal(playContext.lastFocus.row,0,'A resumed episode must not inherit an unrelated movie shelf');
console.log('OK: shuffle cancellation/refill, sequential seasons, collection endings and correct episode/movie context on resume.');
