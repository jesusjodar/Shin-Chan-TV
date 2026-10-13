(function(){
'use strict';
function check(ok,message){if(!ok)throw Error(message);}
var original=document.activeElement,player=document.getElementById('player'),hidden=player.hidden;
var controls=document.getElementById('controls'),quiet=controls.classList.contains('quiet');
try{
  player.hidden=false;controls.classList.remove('quiet');
  var buttons=Array.prototype.slice.call(controls.querySelectorAll('.icon-button'));
  check(buttons.length===6,'Se esperan seis controles de reproducción');
  buttons.forEach(function(button){
    button.focus({preventScroll:true});
    var style=getComputedStyle(button);
    check(style.filter==='none','El contorno no debe seguir el icono: '+button.id);
    check(style.borderRadius==='50%'&&style.width===style.height,'El botón debe ser circular: '+button.id);
    check(style.boxShadow==='rgb(255, 255, 255) 0px 0px 0px 2px','Anillo blanco de 2 px: '+button.id);
    check(getComputedStyle(button.querySelector('svg')).filter==='none','El SVG no debe tener filtro');
  });
  check(document.querySelector('#focus-outline feMorphology').getAttribute('radius')==='2','Grosor de tarjetas y temporadas');
  return 'OK: seis botones circulares, anillo blanco de 2 px y ningún contorno sobre los glifos';
}finally{
  player.hidden=hidden;controls.classList.toggle('quiet',quiet);
  if(original&&original.isConnected)original.focus({preventScroll:true});
}
})();
