/* POC Ops Center — standalone runtime: Firebase Auth + Firestore stand in for the claude.ai capabilities */
(function(){
"use strict";
var CFG=window.POC_CONFIG||{};
if(!CFG.firebase||!CFG.firebase.apiKey||/PASTE/.test(CFG.firebase.apiKey)){document.addEventListener("DOMContentLoaded",function(){var d=document.createElement("div");d.className="poc-login";d.innerHTML='<div class="poc-login-box"><h1>Setup needed</h1><p>Open <b>config.js</b> and paste your Firebase web app settings (see README, step 3).</p></div>';document.body.appendChild(d)});return}
firebase.initializeApp(CFG.firebase);
var auth=firebase.auth(),fs=firebase.firestore();
var ownerEmail=String(CFG.ownerEmail||"").trim().toLowerCase();
var resolveUser,userP=new Promise(function(r){resolveUser=r});
var assetCache={};
var assetReq={};window.__pocSite=true;
window.__assetUrl=function(id){if(assetCache[id])return assetCache[id];if(id&&!assetReq[id]&&auth.currentUser){assetReq[id]=1;fs.doc("assets/"+id).get().then(function(d){if(d.exists){assetCache[id]=d.data().data;window.dispatchEvent(new CustomEvent("poc-asset",{detail:id}))}else assetReq[id]=0}).catch(function(){setTimeout(function(){assetReq[id]=0},3000)})}return "data:image/gif;base64,R0lGODlhAQABAAAAACw="};
function initials(n){return String(n||"?").split(/[\s@.]+/).filter(Boolean).slice(0,2).map(function(x){return x[0].toUpperCase()}).join("")}
function avatar(name,color){var s='<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="'+color+'"/><text x="32" y="41" font-family="Arial" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">'+initials(name)+'</text></svg>';return "data:image/svg+xml;base64,"+btoa(s)}
function colorOf(id){var h=0;for(var i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))>>>0;return "hsl("+(h%360)+",55%,45%)"}
function profileOf(id,p){p=p||{};var c=colorOf(id);return {id:id,name:p.name||"",avatarUrl:p.photo||avatar(p.name||p.email||"?",c),color:c,email:p.email||null,at:p.at||null,isMe:auth.currentUser&&auth.currentUser.uid===id,guest:false}}
function showLogin(msg){
  var old=document.getElementById("pocLogin");if(old)old.remove();
  var d=document.createElement("div");d.id="pocLogin";d.className="poc-login";
  d.innerHTML='<div class="poc-login-box"><div class="poc-mark">EM</div><h1>POC Ops Center</h1><p>Expert Mobile Communications</p>'+
   '<button id="pocG" class="poc-btn">Sign in with Google</button><div class="poc-or">or get a sign-in link by email</div>'+
   '<form id="pocE"><input id="pocEm" type="email" required placeholder="name@expertmobile.ca"><button class="poc-btn sec">Email me a link</button></form><p id="pocMsg" class="poc-msg">'+(msg||"")+'</p>'+
   '<p class="poc-foot">Powered by Masum_Jubayel</p></div>';
  document.body.appendChild(d);
  document.getElementById("pocG").onclick=function(){auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function(e){document.getElementById("pocMsg").textContent=e.message})};
  document.getElementById("pocE").onsubmit=function(e){e.preventDefault();var em=document.getElementById("pocEm").value.trim();
    auth.sendSignInLinkToEmail(em,{url:location.origin+location.pathname,handleCodeInApp:true}).then(function(){try{localStorage.setItem("pocEmail",em)}catch(_){}document.getElementById("pocMsg").textContent="Check your inbox for the sign-in link (also the junk folder)."}).catch(function(e){document.getElementById("pocMsg").textContent=e.message})};
}
if(auth.isSignInWithEmailLink(location.href)){var em=null;try{em=localStorage.getItem("pocEmail")}catch(_){}if(!em)em=prompt("Confirm your email to finish signing in:");
  auth.signInWithEmailLink(em,location.href).then(function(){history.replaceState(null,"",location.pathname)}).catch(function(e){showLogin(e.message)})}
var started=false;
auth.onAuthStateChanged(function(u){
  if(!u){if(!document.body)document.addEventListener("DOMContentLoaded",function(){showLogin()});else showLogin();return}
  var l=document.getElementById("pocLogin");if(l)l.remove();
  if(started){location.reload();return}started=true;
  var name=u.displayName||(u.email||"").split("@")[0];
  fs.doc("profiles/"+u.uid).set({name:name,email:u.email||"",photo:u.photoURL||"",nameLower:(name+" "+(u.email||"")).toLowerCase(),at:new Date().toISOString()},{merge:true}).catch(function(){});
  fs.collection("assets").get().then(function(s){s.docs.forEach(function(d){assetCache[d.id]=d.data().data})}).catch(function(){}).then(function(){resolveUser(u)});
  setTimeout(function(){var t=document.querySelector(".tb-actions");if(t&&!document.getElementById("pocOut")){var b=document.createElement("button");b.id="pocOut";b.className="ibtn";b.title="Sign out";b.setAttribute("aria-label","Sign out");b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>';b.onclick=function(){auth.signOut()};t.appendChild(b)}},1500);
});
function isOwner(u){return !!(u&&u.email&&u.email.toLowerCase()===ownerEmail)}
/* Firestore cannot store arrays inside arrays — encode them as {__a:[...]} on write and decode on read */
function enc(v){if(Array.isArray(v))return v.map(function(x){return Array.isArray(x)?{__a:enc(x)}:enc(x)});if(v&&typeof v==="object"&&Object.getPrototypeOf(v)===Object.prototype){var o={};for(var k in v)if(v[k]!==undefined)o[k]=enc(v[k]);return o}return v}
function dec(v){if(Array.isArray(v))return v.map(function(x){return (x&&typeof x==="object"&&!Array.isArray(x)&&Object.keys(x).length===1&&("__a" in x))?dec(x.__a):dec(x)});if(v&&typeof v==="object"&&Object.getPrototypeOf(v)===Object.prototype){var o={};for(var k in v)o[k]=dec(v[k]);return o}return v}
function wdoc(sn){return {exists:sn.exists,id:sn.id,data:function(){return sn.exists?dec(sn.data()):undefined}}}
function wq(sn){return {docs:sn.docs.map(wdoc),size:sn.size,empty:sn.empty}}
function docW(p){var r=fs.doc(p);return {id:r.id,get:function(){return r.get().then(wdoc)},set:function(d,o){return o?r.set(enc(d),o):r.set(enc(d))},update:function(d){return r.update(enc(d))},delete:function(){return r.delete()},onSnapshot:function(f,e){return r.onSnapshot(function(sn){f(wdoc(sn))},e)}}}
function qW(q){return {limit:function(n){return qW(q.limit(n))},orderBy:function(a,b){return qW(b?q.orderBy(a,b):q.orderBy(a))},where:function(a,b,c){return qW(q.where(a,b,c))},get:function(){return q.get().then(wq)},onSnapshot:function(f,e){return q.onSnapshot(function(sn){f(wq(sn))},e)}}}
var dbW={doc:docW,collection:function(n){return qW(fs.collection(n))}};
var api={
  db:function(){return userP.then(function(){return dbW})},
  user:function(){return userP.then(function(u){var own=isOwner(u);var me={id:u.uid,name:u.displayName||(u.email||"").split("@")[0],avatarUrl:u.photoURL||avatar(u.displayName||u.email,colorOf(u.uid)),color:colorOf(u.uid),email:u.email||null,isOwner:own,canEdit:own};
    return {me:function(){return Promise.resolve(me)},id:function(){return Promise.resolve(me.id)},name:function(){return Promise.resolve(me.name)},isOwner:function(){return Promise.resolve(own)},canEdit:function(){return Promise.resolve(own)},can:function(){return Promise.resolve(null)},email:function(){return Promise.resolve(me.email)},
      profiles:function(ids){ids=[].concat(ids);return Promise.all(ids.map(function(id){return fs.doc("profiles/"+id).get().then(function(d){return profileOf(id,d.exists?d.data():null)}).catch(function(){return profileOf(id,null)})})).then(function(a){var o={};a.forEach(function(p){o[p.id]=p});return o})},
      list:function(){return fs.collection("profiles").limit(1000).get().then(function(s){return s.docs.map(function(d){return profileOf(d.id,d.data())})})},
      search:function(q){q=String(q||"").toLowerCase().trim();return fs.collection("profiles").limit(500).get().then(function(s){return s.docs.map(function(d){return Object.assign({id:d.id},d.data())}).filter(function(p){return !q||(p.nameLower||"").indexOf(q)>=0}).slice(0,8).map(function(p){return profileOf(p.id,p)})}).catch(function(){return []})}}})},
  assets:function(){return userP.then(function(u){return {upload:function(blob){return new Promise(function(res,rej){if(blob.size>700000){rej({code:"too_large",message:"Use an image under 700 KB"});return}var r=new FileReader();r.onload=function(){var id=Math.random().toString(36).slice(2)+Date.now().toString(36);fs.doc("assets/"+id).set({data:r.result,type:blob.type,at:new Date().toISOString()}).then(function(){assetCache[id]=r.result;res({id:id,url:r.result,sizeBytes:blob.size,contentType:blob.type})}).catch(rej)};r.onerror=rej;r.readAsDataURL(blob)})},list:function(){return Promise.resolve({assets:[]})},delete:function(id){return fs.doc("assets/"+id).delete()}}})},
  downloads:function(){return Promise.resolve({save:function(o){var b=o.data instanceof Blob?o.data:new Blob([o.data]);var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=o.filename;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},2000);return Promise.resolve({status:"saved"})}})}
};
window.claude={use:function(n){return api[n]?api[n]():Promise.resolve(null)}};
})();
