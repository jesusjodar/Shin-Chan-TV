'use strict';
var assert = require('assert');
var server = require('../service/utf8.js');
// Un carácter multibyte (ñ, é…) partido entre dos trozos TCP debe sobrevivir.
var bytes = Buffer.from('Quieren llevarse a la señorita Matsuzaka', 'utf8');
for (var i = 1; i < bytes.length - 1; i++) {
  assert.strictEqual(server.joinChunks([bytes.slice(0, i), bytes.slice(i)]), 'Quieren llevarse a la señorita Matsuzaka', 'corte en byte ' + i);
}
// El método antiguo (unir texto) sí se rompe en algún corte: el caso existe.
var broken = false;
for (var j = 1; j < bytes.length - 1; j++) {
  if (bytes.slice(0, j).toString() + bytes.slice(j).toString() !== 'Quieren llevarse a la señorita Matsuzaka') { broken = true; break; }
}
assert(broken, 'se espera al menos un corte que rompa la unión como texto');
console.log('OK: ñ/é intactas aunque el UTF-8 llegue partido entre trozos.');
