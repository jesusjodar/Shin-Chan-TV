const assert=require('assert'),shape=require('../app/squircle');
for(const [w,h,r] of [[420,236.25,48],[163,54,22],[20,20,48]]){
  const path=shape.path(w,h,r);assert(!/NaN|Infinity/.test(path));assert(path.endsWith('Z'));
  const coordinates=[...path.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map(m=>[+m[1],+m[2]]);
  assert(coordinates.length>70);
  for(const [x,y] of coordinates){assert(x>=0&&x<=w);assert(y>=0&&y<=h);}
}
// A superellipse corner is squarer than a circular arc, with zero curvature at its edge joins.
const path=shape.path(420,236.25,48);
assert(path.includes('L412.363,7.637'));
assert(shape.path(442,258.25,59,1.5).startsWith('M60.5,1.5'));
console.log('OK: superellipse corner coordinates, shape bounds and separate focus ring.');
