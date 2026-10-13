(function(root){
'use strict';
// Superellipse corners (exponent 4): curvature tends to zero at the straight-edge joins.
function path(w,h,r,inset,exponent){
  var power=2/(exponent||4);
  inset=inset||0;var left=inset,top=inset,right=w-inset,bottom=h-inset;
  r=Math.min(r,(right-left)/2,(bottom-top)/2);
  function p(x){return Math.round(x*1000)/1000;}
  var d='M'+p(left+r)+','+p(top)+' L'+p(right-r)+','+p(top);
  var corners=[[right-r,top+r,1,-1],[right-r,bottom-r,1,1],[left+r,bottom-r,-1,1],[left+r,top+r,-1,-1]];
  corners.forEach(function(c,index){
    for(var i=1;i<=20;i++){
      var a=i*Math.PI/40,x,y;
      if(index%2===0){x=c[0]+c[2]*r*Math.pow(Math.sin(a),power);y=c[1]+c[3]*r*Math.pow(Math.cos(a),power);}
      else{x=c[0]+c[2]*r*Math.pow(Math.cos(a),power);y=c[1]+c[3]*r*Math.pow(Math.sin(a),power);}
      d+=' L'+p(x)+','+p(y);
    }
    if(index===0)d+=' L'+p(right)+','+p(bottom-r);
    if(index===1)d+=' L'+p(left+r)+','+p(bottom);
    if(index===2)d+=' L'+p(left)+','+p(top+r);
  });
  return d+' Z';
}
root.Squircle={path:path};
if(typeof module!=='undefined'&&module.exports)module.exports=root.Squircle;
})(typeof window!=='undefined'?window:globalThis);
