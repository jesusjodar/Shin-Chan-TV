'use strict';
// Read mvhd without decoding the video or downloading the mdat payload.
function header(buffer, offset) {
  if (offset + 8 > buffer.length) return null;
  var size = buffer.readUInt32BE(offset), bytes = 8;
  if (size === 1) {
    if (offset + 16 > buffer.length) return null;
    size = buffer.readUInt32BE(offset+8)*4294967296+buffer.readUInt32BE(offset+12); bytes=16;
  }
  if (size && (size < bytes || !Number.isSafeInteger(size))) throw new Error('Cabecera MP4 inválida.');
  return {size:size,bytes:bytes,type:buffer.toString('ascii',offset+4,offset+8)};
}
function duration(buffer, start) {
  var container=header(buffer,start||0);
  if (!container || container.type!=='moov') return null;
  var end=Math.min(buffer.length,(start||0)+container.size), offset=(start||0)+container.bytes;
  while(offset+8<=end) {
    var box=header(buffer,offset); if(!box||!box.size)return null;
    if(box.type==='mvhd') {
      var p=offset+box.bytes, version=buffer[p], scale, ticks;
      if(version===0 && p+20<=Math.min(end,offset+box.size)) {scale=buffer.readUInt32BE(p+12);ticks=buffer.readUInt32BE(p+16);}
      else if(version===1 && p+32<=Math.min(end,offset+box.size)) {scale=buffer.readUInt32BE(p+20);ticks=buffer.readUInt32BE(p+24)*4294967296+buffer.readUInt32BE(p+28);}
      else return null;
      var seconds=ticks/scale;return scale>0 && seconds>0 && seconds<86400 ? seconds : null;
    }
    offset+=box.size;
  }
  return null;
}
module.exports={header:header,duration:duration};
