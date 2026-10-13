(async function(){
var rows=Array.from(document.querySelectorAll('.shelf')),results=[];
var initialFrame=document.querySelector('.home-frame').getBoundingClientRect().top,firstLogo=null;
for(var i=0;i<rows.length;i++){
 rows[i].querySelector('button.episode').focus({preventScroll:true});
 await new Promise(r=>setTimeout(r,600));
 var card=document.activeElement,rect=card.getBoundingClientRect(),details=document.querySelector('.details');
 results.push({row:rows[i].id,cardTop:rect.top,ratio:rect.width/rect.height,detailsParent:details.parentElement.id,detailsGap:details.getBoundingClientRect().top-rect.bottom,logo:document.querySelector('.home-brand').getBoundingClientRect().top,frame:document.querySelector('.home-frame').getBoundingClientRect().top});
 if(Math.abs(rect.top-((i===0?493:260)-card.offsetHeight*.02))>1||details.parentElement!==rows[i]||document.querySelector('.home-frame').getBoundingClientRect().top!==initialFrame)throw Error('Layout incorrecto '+rows[i].id);
 if(i===0)firstLogo=document.querySelector('.home-brand').getBoundingClientRect().top;
 if(i>0&&document.querySelector('.home-brand').getBoundingClientRect().top>=firstLogo)throw Error('Logo no hace scroll '+rows[i].id);
}
rows[2].querySelector('button.episode').focus({preventScroll:true});
return JSON.stringify(results);
})();
