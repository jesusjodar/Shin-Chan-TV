const assert=require('node:assert'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../app/app.js'),'utf8');
const part=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a);return source.slice(a,b);};
const entries=[{season:1,id:1},{season:1,id:2},{season:1,id:3},{kind:'movie',slug:'test'},{season:1,id:4}];
const bounds=[0,0,0,0,0],cards=entries.map((_,i)=>({getBoundingClientRect(){bounds[i]++;return i===1?{left:2000,right:2420}:{left:0,right:420};}}));
const requests=[],timers=[],cleared=[];
const row={querySelectorAll(){return cards;},getBoundingClientRect(){return {left:0,right:1920};}};
const context={current:null,shelves:[{id:'episodes',carousel:row,items:entries,index:2}],activeRow:0,state:{durations:{'1/1':1200,'movie/test':6000}},descriptionCache:{},durationPending:{},durationFailed:{'1/4':true},durationBusy:0,durationTimer:undefined,
 key:e=>e.kind==='movie'?'movie/'+e.slug:e.season+'/'+e.id,
 $:()=>({hidden:false}),api:(path,callback)=>requests.push({path,callback}),
 setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout:id=>cleared.push(id)};
vm.createContext(context);
vm.runInContext(part('function scheduleDurations(){','function drawShelf('),context);
context.scheduleDurations();context.scheduleDurations();
assert.equal(timers.length,2);assert.equal(timers[1].delay,120);assert.equal(cleared[1],1);
context.loadDurations();
assert.deepEqual(requests.map(r=>r.path),['/duration/1/3','/duration/movie/test']);
assert.deepEqual(bounds,[0,1,1,1,0]);assert.equal(context.durationBusy,2);
context.loadDurations();assert.equal(requests.length,2);
const element={classList:{contains:()=>true,toggle(){throw Error('Unexpected layout invalidation');}}};
context.shelves=[{element}];context.activeRow=0;
vm.runInContext(part('function alignRow(row){','function cardDuration('),context);
assert.doesNotThrow(()=>context.alignRow(0));
console.log('OK: cached/failed durations skip geometry, two requests maximum, scroll debounce and same-row focus skips layout.');
