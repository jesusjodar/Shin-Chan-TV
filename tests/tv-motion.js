(async function(){
function check(ok,message){if(!ok)throw Error(message);}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}
var original=document.activeElement,positions=(JSON.parse(localStorage.getItem('shinchan-tv-v1')||'{}')||{}).positions;
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{
 check(document.querySelectorAll('.focus-ring').length===0,'No quedan contornos SVG');
 var card=document.querySelector('#episodes [data-index="0"]');card.focus({preventScroll:true});await wait(1200);
 check(getComputedStyle(card).outlineStyle==='none','Sin outline rectangular');
 var ring=getComputedStyle(card).filter;
 check(ring.indexOf('drop-shadow')>=0,'Anillo en foco');
 check(/255,\s*255,\s*255/.test(ring),'Anillo blanco puro');
 check(Math.abs(new DOMMatrix(getComputedStyle(card).transform).a-1.04)<.001,'Zoom del 4 %');
 var selected=document.querySelector('#seasons .selected');
 check(Math.abs(new DOMMatrix(getComputedStyle(selected).transform).a-1.04)<.001,'Temporada seleccionada con zoom');
 if(document.activeElement!==selected)check(getComputedStyle(selected).outlineStyle==='none'&&getComputedStyle(selected).filter==='none','Seleccionada sin foco no lleva anillo');
 async function horizontal(row,item){
  var start=row.scrollLeft;item.focus({preventScroll:true});
  var target=Math.min(row.scrollWidth-row.clientWidth,Math.max(0,(item.parentElement.classList.contains('ranked-card')?item.parentElement:item).offsetLeft-88));
  if(!reduced){check(Math.abs(row.scrollLeft-start)<2,'Scroll no salta al destino');await wait(250);check(row.scrollLeft>start&&row.scrollLeft<target,'Scroll tiene un punto intermedio: '+start+' → '+row.scrollLeft+' → '+target);}
  await wait(900);check(Math.abs(row.scrollLeft-target)<2,'Scroll alcanza el destino');
 }
 await horizontal(document.getElementById('episodes'),document.querySelector('#episodes [data-index="3"]'));
 var shelves=document.getElementById('shelves'),start=new DOMMatrix(getComputedStyle(shelves).transform).m42;
 document.querySelector('#shelf-movies .episode').focus({preventScroll:true});
 if(!reduced){check(Math.abs(new DOMMatrix(getComputedStyle(shelves).transform).m42-start)<2,'Scroll vertical no salta');await wait(160);var middle=new DOMMatrix(getComputedStyle(shelves).transform).m42;await wait(300);check(middle!==start&&Math.abs(middle-new DOMMatrix(getComputedStyle(shelves).transform).m42)>1,'Scroll vertical tiene un punto intermedio');}
 card.focus({preventScroll:true});await wait(1200);
 await horizontal(document.getElementById('seasons'),document.querySelectorAll('#seasons button')[6]);
 check(JSON.stringify((JSON.parse(localStorage.getItem('shinchan-tv-v1')||'{}')||{}).positions)===JSON.stringify(positions),'Historial conservado');
 return 'OK: zoom, sin contornos, scroll suave vertical/horizontal/temporadas y progreso conservado';
}finally{if(original&&original.isConnected)original.focus({preventScroll:true});}
})();
