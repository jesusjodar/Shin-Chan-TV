'use strict';
// Une trozos de red como bytes y decodifica al final: un carácter
// multibyte (ñ, é…) puede llegar partido entre dos trozos TCP y
// romperse si se unen como texto.
module.exports = {
  joinChunks: function(chunks){ return Buffer.concat(chunks).toString('utf8'); }
};
