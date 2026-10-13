'use strict';
const assert=require('assert'),mp4=require('../service/mp4');
function box(type,body){const h=Buffer.alloc(8);h.writeUInt32BE(8+body.length);h.write(type,4);return Buffer.concat([h,body]);}
const v0=Buffer.alloc(20);v0.writeUInt32BE(1000,12);v0.writeUInt32BE(1217440,16);
assert.equal(mp4.duration(box('moov',box('mvhd',v0))),1217.44);
const v1=Buffer.alloc(32);v1[0]=1;v1.writeUInt32BE(48000,20);v1.writeUInt32BE(58437120,28);
assert.equal(mp4.duration(box('moov',box('free',Buffer.alloc(12)))),null);
assert.equal(mp4.duration(box('moov',box('mvhd',v1))),1217.44);
assert.equal(mp4.duration(box('moov',box('mvhd',v0.slice(0,10)))),null);
const invalid=Buffer.alloc(8);invalid.writeUInt32BE(4);assert.throws(()=>mp4.header(invalid,0));
assert.equal(mp4.header(Buffer.alloc(4),0),null);
const extended=Buffer.alloc(16);extended.writeUInt32BE(1);extended.write('mdat',4);extended.writeUInt32BE(1,8);extended.writeUInt32BE(64,12);assert.equal(mp4.header(extended,0).size,4294967360);
console.log('OK: mvhd v0/v1, truncated data, invalid atom sizes and 64-bit atom headers.');
