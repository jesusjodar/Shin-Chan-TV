'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'shinchan-install-'));
try{
  fs.mkdirSync(path.join(dir,'scripts'));fs.mkdirSync(path.join(dir,'bin'));
  const script=path.join(dir,'scripts/install-tv.sh');
  fs.copyFileSync(path.join(__dirname,'../scripts/install-tv.sh'),script);
  let result=cp.spawnSync('bash',[script],{cwd:dir,encoding:'utf8'});
  assert.equal(result.status,1);assert.match(result.stdout,/No hay .ipk/);
  fs.mkdirSync(path.join(dir,'dist'));fs.writeFileSync(path.join(dir,'dist/app.ipk'),'test');
  for(const command of ['ares-install','ares-launch'])fs.writeFileSync(path.join(dir,'bin',command),'#!/bin/sh\nprintf "%s\\n" "'+command+' $*" >> "$CHECK_LOG"\n',{mode:0o755});
  const log=path.join(dir,'calls.txt');
  result=cp.spawnSync('bash',[script,'dist/app.ipk'],{cwd:dir,encoding:'utf8',env:{...process.env,PATH:path.join(dir,'bin')+path.delimiter+process.env.PATH,TV_DEVICE:'mi-tv',CHECK_LOG:log}});
  assert.equal(result.status,0,result.stderr);
  assert.equal(fs.readFileSync(log,'utf8'),'ares-install --device mi-tv dist/app.ipk\nares-launch --device mi-tv com.shinchaneros.tv\n');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
console.log('OK: missing package reports a useful error; the configured TV device reaches install and launch.');
