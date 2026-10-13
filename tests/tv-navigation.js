(async function(){
function press(code){document.dispatchEvent(new KeyboardEvent('keydown',{keyCode:code,bubbles:true}));}
function check(condition,message){if(!condition)throw Error(message);}
document.querySelectorAll('.shelf').forEach(function(row){row.querySelector('.episode').focus({preventScroll:true});});
var first=document.querySelector('#shelf-episodes .episode');first.focus({preventScroll:true});
for(var row=0;row<6;row++){
 check(+document.activeElement.dataset.row===row,'Fila '+row);
 press(39);check(+document.activeElement.dataset.index===1,'Derecha '+row);
 if(row<5)press(40);
}
press(40);check(+document.activeElement.dataset.row===5,'Límite inferior');
for(var row=4;row>=0;row--){press(38);check(+document.activeElement.dataset.row===row,'Subir '+row);check(+document.activeElement.dataset.index===1,'Recuerda tarjeta '+row);}
press(38);check(document.activeElement.dataset.season,'Temporadas');press(40);check(document.activeElement===document.querySelector('#shelf-episodes [data-index="1"]'),'Bajar desde temporada');
var favorites=document.querySelectorAll('#shelf-favorites .episode');favorites[Math.min(10,favorites.length-1)].focus({preventScroll:true});
await new Promise(r=>setTimeout(r,600));check(document.activeElement.getBoundingClientRect().left>70,'Ranking doble visible');check(document.querySelectorAll('.details').length===1,'Información única');
return 'OK: seis filas, flechas, límites, memoria de tarjeta, temporadas, ranking y bloque único';
})();
