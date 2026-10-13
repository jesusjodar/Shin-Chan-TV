const fs=require('fs'),assert=require('assert'),catalog=require('../service/catalog');
const fixture=process.argv[2]||require('path').join(__dirname,'fixtures');
const episodes=catalog.episodes(fs.readFileSync(fixture+'/season1.html','utf8'),1);
assert(episodes.length===33);assert(episodes[0].title.includes('se va de compras'));assert(episodes[3].id===4 && episodes[3].title);assert(episodes.every(e=>e.season===1 && e.title && /^\/thumbnails\//.test(e.thumbnail)));assert(new Set(episodes.map(e=>e.id)).size===episodes.length);
assert(catalog.seasons(fs.readFileSync(fixture+'/seasons.html','utf8')).length===27);
assert(catalog.video(fs.readFileSync(fixture+'/episode.html','utf8'))==='https://play.shinchaneros.tv/01x001.mp4');
assert.throws(()=>catalog.video('<html>Error</html>'));
console.log('OK: 33 episodios reales, 27 temporadas, enlace MP4 y rechazo de datos inválidos.');
