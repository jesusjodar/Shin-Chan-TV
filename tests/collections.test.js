'use strict';
const assert=require('assert'),fs=require('fs'),catalog=require('../service/catalog');
const read=name=>fs.readFileSync(__dirname+'/fixtures/'+name,'utf8');
assert.equal(catalog.homeScript(read('home.html')),'/_next/static/chunks/0i4u99l3m1rop.js');
const chunks=catalog.collectionChunks(read('home.js'));
assert.deepEqual(Object.keys(chunks),['specials','travel','fear']);
const counts={specials:30,travel:8,fear:19};
for(const name of Object.keys(counts)){
  const items=catalog.themed(read(name+'.js'));
  assert.equal(items.length,counts[name]);assert.equal(new Set(items.map(e=>e.season+'/'+e.id)).size,items.length);
  assert(items.every(e=>+e.thumbnail.match(/x(\d+)/)[1]===e.id));
}
assert.equal(catalog.themed(read('fear.js')).at(-1).season,27); // Source omits seasonId on some entries.
const movies=catalog.movies(read('movies.html'));assert.equal(movies.length,33);assert.equal(movies[0].slug,'bailarines-de-kasukabe');
assert.equal(catalog.video(read('movie.html')),'https://play.shinchaneros.tv/dinosaurios.mp4');assert(catalog.description(read('movie.html')).includes('Nana'));
const ranking=catalog.favorites(read('ranking.json'));assert.equal(ranking.length,50);assert.equal(ranking[0].likes,122);assert.equal(ranking[0].id,423);assert.equal(ranking[49].rank,50);
assert.throws(()=>catalog.favorites('{"ranking":[{"favoriteCount":-1}]}'));
assert.throws(()=>catalog.themed('invalid'));assert.throws(()=>catalog.collectionChunks('invalid'));
assert.throws(()=>catalog.video(read('movie.html').replaceAll('https://play.shinchaneros.tv/','https://evil.example/')));
console.log('OK: películas, ranking y likes, tres colecciones, temporadas ausentes y rechazo de datos inválidos.');
