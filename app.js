import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js";


import {
  firestoreDb,
  firebaseConfig
} from "./firebase.js";


const auth = getAuth();

const userCreationApp =
  initializeApp(firebaseConfig, "userCreationApp");

const userCreationAuth =
  getAuth(userCreationApp);

const functions = getFunctions();
const adminDeleteUser = httpsCallable(functions, "adminDeleteUser");


let userRole = "user";
let currentUser = null;
let cloudLoaded = false;
let saveInProgress = false;
let saveQueued = false;


let currentProfile = {
  name: '',
  designation: '',
  image: ''
};


window.getUserRole = () => userRole;

const loginScreen = document.querySelector("#loginScreen");
const appShell = document.querySelector(".shell");
const logoutButton = document.querySelector("#logoutButton");
const loginButton = document.querySelector("#loginButton");

if (loginButton) {
  loginButton.addEventListener("click", async () => {
    const emailEl = document.querySelector("#loginEmail");
    const passwordEl = document.querySelector("#loginPassword");
    const message = document.querySelector("#loginMessage");

    const email = emailEl?.value.trim() || "";
    const password = passwordEl?.value || "";

    if (!email || !password) {
      if (message) message.textContent = "Email और password दोनों भरें.";
      return;
    }

    if (message) message.textContent = "Login ho raha hai...";

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (message) message.textContent = "Login successful";
    } catch (error) {
      console.error("Login error:", error);
      if (message) {
        const messages = {
          "auth/invalid-credential": "Email या password गलत है.",
          "auth/user-not-found": "यह user account नहीं मिला.",
          "auth/wrong-password": "Password गलत है.",
          "auth/invalid-email": "Email format सही नहीं है.",
          "auth/too-many-requests": "बहुत बार प्रयास हुआ. थोड़ी देर बाद फिर try करें."
        };
        message.textContent = messages[error.code] || ("Login failed: " + error.message);
      }
    }
  });
}

async function handleLogout() {
  if (!auth.currentUser) {
    window.location.replace("login.html");
    return;
  }

  try {
    await signOut(auth);
    window.location.replace("login.html");
  } catch (error) {
    console.error("Logout error:", error);
    alert("Logout failed. Please try again.");
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}

async function loadCloudData() {
  try {
    const snap = await getDoc(doc(firestoreDb, "appData", "main"));
    if (!snap.exists()) return false;

    const cloudData = snap.data() || {};
    db = {
      ...blank,
      ...cloudData,
      sites: Array.isArray(cloudData.sites) ? cloudData.sites : [],
      stock: Array.isArray(cloudData.stock) ? cloudData.stock : [],
      oil: Array.isArray(cloudData.oil) ? cloudData.oil : [],
      labour: Array.isArray(cloudData.labour) ? cloudData.labour : [],
      bills: Array.isArray(cloudData.bills) ? cloudData.bills : [],
      concrete: Array.isArray(cloudData.concrete) ? cloudData.concrete : [],
      completedProjects: Array.isArray(cloudData.completedProjects) ? cloudData.completedProjects : [],
      profile: cloudData.profile || {name: "", designation: ""}
    };
    localStorage.setItem("amcSiteFlowV2", JSON.stringify(db));
    return true;
  } catch (error) {
    console.error("Firebase cloud load error:", error);
    throw error;
  }
}





onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  console.log("AUTH STATE USER:", user);

  if (!user) {
    userRole = "user";
    if (loginScreen) loginScreen.style.display = "none";
    if (appShell) appShell.style.display = "none";
    window.location.replace("login.html");
    return;
  }



  try {
const userDoc =
  await getDoc(
    doc(
      firestoreDb,
      "users",
      user.uid
    )
  );

const userData =
  userDoc.exists()
    ? userDoc.data()
    : {};

userRole =
  userData.role || "user";

console.log(
  "USER ROLE:",
  userRole
);


if(
  userData.status === "inactive"
){

  alert(
    "Your account is inactive. Please contact Admin."
  );

  await signOut(auth);

  window.location.replace(
    "login.html"
  );

  return;
}

applyBackupRoleUI();


const userManagementNav =
  document.querySelector(
    '#userManagementNav'
  );

if(userManagementNav){

  userManagementNav.style.display =
    userRole === 'admin'
      ? 'flex'
      : 'none';

}


if(userRole === 'admin'){

  setTimeout(
    () => loadUserManagement(),
    0
  );

}
    const cloudExists = await loadCloudData();
    cloudLoaded = true;

await loadCurrentProfile();

    if (!cloudExists) {
      console.log("Firebase: first-time cloud document will be created on first save.");
    }

    if (loginScreen) loginScreen.style.display = "none";
    if (appShell) appShell.style.display = "";

    all();
  } catch (error) {
    console.error("Auth initialization error:", error);
    if (appShell) appShell.style.display = "none";
    alert("Account data load failed. Please refresh and try again.");
  }
});

const $ = s => document.querySelector(s);

const $$ = s =>
  [...document.querySelectorAll(s)];

const today =
  new Date().toISOString().slice(0, 10);
const blank={
  version:2,
  sites:[],
  stock:[],
  oil:[],
  labour:[],
  bills:[],
  concrete:[],
  profile:{name:'',designation:''}
};

let db=JSON.parse(localStorage.getItem('amcSiteFlowV2')||'null')||blank,
    stockTab='balance',
    oilTab='balance';

db.completedProjects=db.completedProjects||[];
db.concrete=db.concrete||[];

const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2}),dateText=d=>{if(!d)return '—';let a=d.split('-');return a[2]+'/'+a[1]+'/'+a[0]},esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));



async function save(){
  localStorage.setItem("amcSiteFlowV2", JSON.stringify(db));

  if (!currentUser || !cloudLoaded) {
    console.warn("Cloud save skipped: authentication/cloud data is not ready.");
    return false;
  }

  if (saveInProgress) {
    saveQueued = true;
    return true;
  }

  saveInProgress = true;

  try {
    await setDoc(doc(firestoreDb, "appData", "main"), db);
    console.log("Firebase: data saved successfully");
    return true;
  } catch(error) {
    console.error("Firebase save error:", error);
    alert("Cloud save failed.\n\nYour data is still safe on this computer. Please check your internet connection.");
    return false;
  } finally {
    saveInProgress = false;
    if (saveQueued) {
      saveQueued = false;
      setTimeout(() => save(), 100);
    }
  }
}


function applyBackupRoleUI(){
  const downloadButton = document.querySelector('#downloadBackup');
  const restoreButton = document.querySelector('#restoreBackup');
  const isAdmin = userRole === 'admin';

  if(downloadButton){
    downloadButton.style.display = isAdmin ? '' : 'none';
  }

  if(restoreButton){
    restoreButton.style.display = isAdmin ? '' : 'none';
  }
}

function downloadBackup(){

  if(userRole !== 'admin'){
    alert('Only Admin can download backup.');
    return;
  }

  const backup = {
    app: 'AMC SiteFlow',
    version: db.version || 2,
    backupDate: new Date().toISOString(),
    data: db
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'AMC-SiteFlow-Backup-' +
    new Date().toISOString().slice(0,10) + '.json';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('AMC SiteFlow backup downloaded successfully');
  alert('Backup successfully downloaded.');
}

window.downloadBackup = downloadBackup;

function restoreBackup(){

  if(userRole !== 'admin'){
    alert('Only Admin can restore backup.');
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if(!file) return;

    try{
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming = parsed?.data ?? parsed;

      if(!incoming || typeof incoming !== 'object' || Array.isArray(incoming)){
        throw new Error('Invalid backup format.');
      }

      if(parsed?.app && parsed.app !== 'AMC SiteFlow'){
        throw new Error('This backup file is not from AMC SiteFlow.');
      }

      const restored = {
        ...blank,
        ...incoming,
        sites: Array.isArray(incoming.sites) ? incoming.sites : [],
        stock: Array.isArray(incoming.stock) ? incoming.stock : [],
        oil: Array.isArray(incoming.oil) ? incoming.oil : [],
        labour: Array.isArray(incoming.labour) ? incoming.labour : [],
        bills: Array.isArray(incoming.bills) ? incoming.bills : [],
        concrete: Array.isArray(incoming.concrete) ? incoming.concrete : [],
        completedProjects: Array.isArray(incoming.completedProjects) ? incoming.completedProjects : [],
        profile: incoming.profile || {name:'', designation:''}
      };

      if(!confirm(
        'Restore this AMC SiteFlow backup?\n\n' +
        'Current app data will be replaced by the backup data.'
      )) return;

      db = restored;
      localStorage.setItem('amcSiteFlowV2', JSON.stringify(db));

      const saved = await save();

      if(saved === false){
        all();
        alert(
          'Backup was loaded locally, but cloud save failed.\n\n' +
          'Please check your internet connection and try again.'
        );
        return;
      }

      all();
      alert('Backup restored successfully.');

    }catch(error){
      console.error('Backup restore error:', error);
      alert('Invalid backup file. Nothing was changed.');
    }
  });

  input.click();
}

window.restoreBackup = restoreBackup;

function currentSite(){

  return $('#siteFilter').value ||
    'All Projects';

}


function data(
  k,
  site = currentSite()
){

  return site === 'All Projects'
    ? db[k]
    : db[k].filter(
        x => x.site === site
      );

}



function select(id,values,all){let e=$(id),old=e.value;e.innerHTML='<option value="'+all+'">'+all+'</option>'+values.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');if(values.includes(old)||old===all)e.value=old}





function profile(){
  return currentProfile.name && currentProfile.designation
    ? currentProfile.name+' · '+currentProfile.designation
    : '';
}
function dateSelect(id,values,all){let e=$(id),old=e.value;e.innerHTML='<option value="'+all+'">'+all+'</option>'+values.map(x=>'<option value="'+x+'">'+dateText(x)+'</option>').join('');if(values.includes(old)||old===all)e.value=old}
function activeSites(){return db.sites.filter(x=>!db.completedProjects.includes(x))}


async function compressProfileImage(file){

  return new Promise((resolve,reject)=>{

    const reader=new FileReader();

    reader.onload=()=>{

      const img=new Image();

      img.onload=()=>{

        const maxSize=300;

        let width=img.width;
        let height=img.height;

        if(width>height){

          if(width>maxSize){
            height=Math.round(height*(maxSize/width));
            width=maxSize;
          }

        }else{

          if(height>maxSize){
            width=Math.round(width*(maxSize/height));
            height=maxSize;
          }

        }

        const canvas=document.createElement('canvas');

        canvas.width=width;
        canvas.height=height;

        const ctx=canvas.getContext('2d');

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        resolve(
          canvas.toDataURL(
            'image/jpeg',
            0.80
          )
        );

      };

      img.onerror=()=>reject(
        new Error('Unable to read profile image.')
      );

      img.src=reader.result;

    };

    reader.onerror=()=>reject(
      new Error('Unable to read profile image.')
    );

    reader.readAsDataURL(file);

  });

}


async function loadCurrentProfile(){

  if(!currentUser || !currentUser.uid){
    return;
  }

  try{

    const profileDoc =
      await getDoc(
        doc(
          firestoreDb,
          "profiles",
          currentUser.uid
        )
      );

    if(profileDoc.exists()){

      const p = profileDoc.data();

      currentProfile = {
        name: p.name || '',
        designation: p.designation || '',
        image: p.image || ''
      };

    }else{

      currentProfile = {
        name: '',
        designation: '',
        image: ''
      };

    }

    console.log(
      "CURRENT PROFILE:",
      currentProfile
    );

  }catch(error){

    console.error(
      "Profile load error:",
      error
    );

    currentProfile = {
      name: '',
      designation: '',
      image: ''
    };

  }
}




function refreshSelects(){

  select('#siteFilter',db.sites,'All Projects');

  select('#attendanceSite',db.sites,'All Projects');

  select('#billSite',db.sites,'All Projects');

  select('#reportSite',db.sites,'All Projects');


  dateSelect(
    '#attendanceDate',
    [...new Set(db.labour.map(x=>x.date))].sort().reverse(),
    'All dates'
  );


  dateSelect(
    '#billDate',
    [...new Set(db.bills.map(x=>x.date))].sort().reverse(),
    'All dates'
  );


  select(
    '#billContractor',
    [
      ...new Set([
        ...db.bills.map(x=>x.contractor),
        ...db.stock.map(x=>x.contractor)
      ])
    ]
    .filter(Boolean)
    .sort(),
    'All contractors'
  );


  /* Reports Contractor Filter */

  select(
    '#reportContractor',
    [
      ...new Set([
        ...db.stock.map(x=>x.contractor),
        ...db.labour.map(x=>x.contractor),
        ...db.bills.map(x=>x.contractor),
        ...(db.concrete || []).map(x=>x.contractor)
      ])
    ]
    .filter(Boolean)
    .sort(),
    'All Contractors'
  );


$('#profileName').textContent=currentProfile.name?'Edit profile':'Set Entry Profile';
$('#profileRole').textContent=currentProfile.name
  ? (currentProfile.name+' · '+currentProfile.designation)
  : 'नाम और पद लिखें';

let a=$('#avatar');



if(a){

  const profileImage =
    typeof currentProfile.image === 'string'
      ? currentProfile.image.trim()
      : '';

  if(profileImage){

    a.textContent = '';

    a.style.backgroundImage =
      'url("' + profileImage.replace(/"/g, '%22') + '")';

    a.style.backgroundSize = 'cover';

    a.style.backgroundPosition = 'center';

    a.style.backgroundRepeat = 'no-repeat';

    a.setAttribute(
      'aria-label',
      'Profile photo'
    );

  }else{

    a.textContent = '+';

    a.style.backgroundImage = 'none';

    a.style.backgroundSize = '';

    a.style.backgroundPosition = '';

    a.style.backgroundRepeat = '';

    a.setAttribute(
      'aria-label',
      'Add profile photo'
    );

  }

}







}
function balance(){let o={};data('stock').forEach(x=>{let k=x.material+'|'+x.unit;if(!o[k])o[k]={material:x.material,unit:x.unit,qty:0,value:0};let s=x.type==='Receive'||x.type==='Return'?1:-1;o[k].qty+=s*Number(x.qty);o[k].value+=s*Number(x.qty)*Number(x.rate)});return Object.values(o)}


function debit(){
  let o={};

  data('stock')
    .filter(x=>x.contractor)
    .forEach(x=>{

      const contractor=x.contractor || '—';

      if(!o[contractor]){
        o[contractor]={
          name:contractor,
          issued:0,
          returned:0,
          debit:0
        };
      }

      const qty=Number(x.qty)||0;
      const rate=Number(x.rate)||0;
      const value=qty*rate;

      if(x.type==='Issue'){
        o[contractor].issued+=qty;
        o[contractor].debit+=value;
      }

      if(x.type==='Return'){
        o[contractor].returned+=qty;
        o[contractor].debit-=value;
      }
    });

  return Object.values(o);
}



function contractorLedgerDetails(site,from,to,contractor){

  const rows=[];

  data('stock')
    .filter(x=>{

      if(!x.contractor) return false;

      if(x.type!=='Issue' && x.type!=='Return'){
        return false;
      }

      if(site!=='All Projects' && x.site!==site){
        return false;
      }

      if(contractor && contractor!=='All Contractors' && x.contractor!==contractor){
        return false;
      }

      if(from && x.date<from){
        return false;
      }

      if(to && x.date>to){
        return false;
      }

      return true;
    })
    .sort((a,b)=>
      String(a.date||'').localeCompare(String(b.date||''))
    )
    .forEach(x=>{

      const qty=Number(x.qty)||0;
      const rate=Number(x.rate)||0;
      const amount=qty*rate;

      rows.push([
        dateText(x.date),
        x.type || '—',
        x.contractor || '—',
        x.site || '—',
        x.material || '—',
        qty,
        x.unit || '—',
        money(rate),
        money(amount),
        x.incharge || '—',
        profile() || '—'
      ]);
    });

  return rows;
}





function table(head,rows){return '<table><thead><tr>'+head.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+(rows||'<tr><td colspan="'+head.length+'" class="empty">No records found.</td></tr>')+'</tbody></table>'}
function actions(kind,id){
  const edit = '<button type="button" class="record-action edit" data-edit="'+kind+'" data-id="'+id+'">Edit</button>';
  const del = userRole === "admin"
    ? '<button type="button" class="record-action remove" data-delete="'+kind+'" data-id="'+id+'">Delete</button>'
    : '';
  return edit + del;
}function dashboard(){let b=balance(),d=debit(),low=b.filter(x=>x.qty<25),p=d.filter(x=>x.debit>0),fuel=data('oil').filter(x=>x.type==='Issue').reduce((a,x)=>a+Number(x.litres),0);let cards=[['Stock value',money(b.reduce((a,x)=>a+x.value,0))],['Fuel consumed',fuel+' L'],['Labour records',data('labour').length],['Pending material debit',money(p.reduce((a,x)=>a+x.debit,0))]];$('#summaryCards').innerHTML=cards.map(x=>'<article class="card"><label>'+x[0]+'</label><b>'+x[1]+'</b><small>'+currentSite()+'</small></article>').join('');$('#pendingCount').textContent=p.length+' contractors';$('#pendingReturns').innerHTML=p.length?p.map(x=>'<div class="row"><div><b>'+esc(x.name)+'</b><small>'+String(x.issued-x.returned)+' quantity pending</small></div><b class="amount red">'+money(x.debit)+'</b></div>').join(''):'<div class="empty">No pending material return.</div>';$('#lowCount').textContent=low.length+' materials';$('#lowStock').innerHTML=low.length?low.map(x=>'<div class="row"><div><b>'+esc(x.material)+'</b><small>Minimum alert: 25 '+esc(x.unit)+'</small></div><b class="amount red">'+x.qty+' '+esc(x.unit)+'</b></div>').join(''):'<div class="empty">No low-stock item.</div>';let act=[...data('stock').map(x=>({d:x.date,t:'Material '+x.type+': '+x.qty+' '+x.unit+' '+x.material,s:x.site})),...data('oil').map(x=>({d:x.date,t:'Fuel '+x.type+': '+x.litres+' L '+x.fuel,s:x.machine}))].sort((a,b)=>b.d.localeCompare(a.d)).slice(0,6);$('#activity').innerHTML=act.length?act.map(x=>'<div class="row"><div><b>'+esc(x.t)+'</b><small>'+dateText(x.d)+' · '+esc(x.s)+'</small></div></div>').join(''):'<div class="empty">No entry yet. Add a project and material entry.</div>';$('#siteSnapshot').innerHTML=db.sites.length?db.sites.map(s=>{let complete=db.completedProjects.includes(s);return '<div class="row"><div><b>'+esc(s)+'</b><small>'+db.stock.filter(x=>x.site===s).length+' material entries · '+(complete?'Completed':'Active')+'</small></div><div><button class="record-action edit" data-complete-project="'+esc(s)+'">'+(complete?'Reopen':'Complete')+'</button><button class="record-action remove" data-delete-project="'+esc(s)+'">Delete project</button></div></div>'}).join(''):'<div class="empty">Add project name manually using “+ Project”.</div>'}
function renderStock(){let r=data('stock');if(stockTab==='balance'){$('#stockContent').innerHTML=table(['Material','Available stock','Estimated value','Unit'],balance().map(x=>'<tr><td><b>'+esc(x.material)+'</b></td><td>'+x.qty.toFixed(2)+'</td><td>'+money(x.value)+'</td><td>'+esc(x.unit)+'</td></tr>').join(''));return}if(stockTab==='consumption')r=r.filter(x=>x.type==='Issue');$('#stockContent').innerHTML=table(['Date','Type','Material','Quantity','Project','Contractor','Store in-charge','Created by','Action'],r.sort((a,b)=>b.date.localeCompare(a.date)).map(x=>'<tr><td>'+dateText(x.date)+'</td><td><span class="status '+(x.type==='Issue'?'issue':'')+'">'+x.type+'</span></td><td>'+esc(x.material)+'</td><td>'+x.qty+' '+esc(x.unit)+'</td><td>'+esc(x.site)+'</td><td>'+esc(x.contractor||'—')+'</td><td>'+esc(x.incharge)+'</td><td>'+esc(profile()||'—')+'</td><td>'+actions('stock',x.id)+'</td></tr>').join(''))}
function renderOil(){let r=data('oil');if(oilTab==='balance'){let x={};r.forEach(a=>x[a.fuel]=(x[a.fuel]||0)+(a.type==='Receive'?Number(a.litres):-Number(a.litres)));$('#oilContent').innerHTML='<div class="cards slim">'+(Object.keys(x).map(k=>'<article class="card"><label>'+esc(k)+' available</label><b>'+x[k].toFixed(2)+' L</b></article>').join('')||'<article class="card"><label>Fuel stock</label><b>0 L</b></article>')+'</div>';return}if(oilTab==='consumption')r=r.filter(x=>x.type==='Issue');$('#oilContent').innerHTML=table(['Date','Type','Fuel','Litres','Machine / vehicle','Meter / hours','Project','Operator','Created by','Action'],r.sort((a,b)=>b.date.localeCompare(a.date)).map(x=>'<tr><td>'+dateText(x.date)+'</td><td><span class="status '+(x.type==='Issue'?'issue':'')+'">'+x.type+'</span></td><td>'+esc(x.fuel)+'</td><td>'+x.litres+' L</td><td>'+esc(x.machine)+'</td><td>'+esc(x.reading||'—')+'</td><td>'+esc(x.site)+'</td><td>'+esc(x.operator)+'</td><td>'+esc(profile()||'—')+'</td><td>'+actions('oil',x.id)+'</td></tr>').join(''))}
function attendance(){let site=$('#attendanceSite').value||'All Projects',day=$('#attendanceDate').value||'All dates',r=db.labour.filter(x=>(site==='All Projects'||x.site===site)&&(day==='All dates'||x.date===day)),count=r.reduce((a,x)=>a+Number(x.skilled)+Number(x.unskilled),0),cost=r.reduce((a,x)=>a+(Number(x.skilled)+Number(x.unskilled))*Number(x.rate),0);$('#labourCards').innerHTML=[['Present labour',count],['Skilled',r.reduce((a,x)=>a+Number(x.skilled),0)],['Wage estimate',money(cost)]].map(x=>'<article class="card"><label>'+x[0]+'</label><b>'+x[1]+'</b></article>').join('');$('#labourTable').innerHTML=table(['Date','Project','Contractor','Trade','Skilled','Unskilled','Rate','Total','Created by','Action'],r.map(x=>'<tr><td>'+dateText(x.date)+'</td><td>'+esc(x.site)+'</td><td>'+esc(x.contractor)+'</td><td>'+esc(x.trade)+'</td><td>'+x.skilled+'</td><td>'+x.unskilled+'</td><td>'+money(x.rate)+'</td><td>'+String(Number(x.skilled)+Number(x.unskilled))+'</td><td>'+esc(profile()||'—')+'</td><td>'+actions('labour',x.id)+'</td></tr>').join(''))}
function billing(){let site=$('#billSite').value||'All Projects',day=$('#billDate').value||'All dates',person=$('#billContractor').value||'All contractors',r=db.bills.filter(x=>(site==='All Projects'||x.site===site)&&(day==='All dates'||x.date===day)&&(person==='All contractors'||x.contractor===person)),names=[...new Set([...r.map(x=>x.contractor),...debit().map(x=>x.name)])];$('#ledger').innerHTML=names.length?names.map(n=>{let a=r.filter(x=>x.contractor===n).reduce((z,x)=>z+Number(x.qty)*Number(x.rate),0),p=r.filter(x=>x.contractor===n).reduce((z,x)=>z+Number(x.paid),0),d=debit().find(x=>x.name===n)?.debit||0;return '<div class="row"><div><b>'+esc(n)+'</b><small>Work '+money(a)+' · Paid '+money(p)+' · Material debit '+money(d)+'</small></div><div><b class="amount '+(a-p-d>0?'red':'green')+'">'+money(a-p-d)+'</b><button class="record-action remove" data-delete-contractor="'+esc(n)+'">Delete contractor data</button></div></div>'}).join(''):'<div class="empty">No contractor entry for this filter.</div>';$('#billTable').innerHTML=table(['Date','Project','Contractor','Work item','Quantity','Rate','Bill amount','Paid','Balance','Created by','Action'],r.map(x=>{let a=Number(x.qty)*Number(x.rate);return '<tr><td>'+dateText(x.date)+'</td><td>'+esc(x.site)+'</td><td>'+esc(x.contractor)+'</td><td>'+esc(x.work)+'</td><td>'+x.qty+' '+esc(x.unit)+'</td><td>'+money(x.rate)+'</td><td>'+money(a)+'</td><td>'+money(x.paid)+'</td><td class="amount '+(a-x.paid>0?'red':'')+'">'+money(a-x.paid)+'</td><td>'+esc(profile()||'—')+'</td><td>'+actions('bill',x.id)+'</td></tr>'}).join(''))}
function dashboardExtras(){let p=debit().filter(x=>x.debit>0),unpaid=data('bills').filter(x=>Number(x.qty)*Number(x.rate)>Number(x.paid));$('#dashboardSummary').innerHTML='<div class="row"><div><b>Active projects</b><small>Projects open for new entries</small></div><b>'+activeSites().length+'</b></div><div class="row"><div><b>Completed projects</b><small>Historical records retained</small></div><b>'+db.completedProjects.length+'</b></div><div class="row"><div><b>Total pending value</b><small>Unpaid bills + material return debit</small></div><b class="amount red">'+money(unpaid.reduce((a,x)=>a+(Number(x.qty)*Number(x.rate)-Number(x.paid)),0)+p.reduce((a,x)=>a+x.debit,0))+'</b></div>';let rows=[...p.map(x=>({n:x.name,d:'Material return pending',v:money(x.debit)})),...unpaid.map(x=>({n:x.contractor,d:'Bill pending · '+dateText(x.date),v:money(Number(x.qty)*Number(x.rate)-Number(x.paid))}))];$('#allPendingCount').textContent=rows.length+' pending';$('#allPending').innerHTML=rows.length?rows.map(x=>'<div class="row"><div><b>'+esc(x.n)+'</b><small>'+esc(x.d)+'</small></div><b class="amount red">'+x.v+'</b></div>').join(''):'<div class="empty">No pending entries.</div>'}
const units={
  length:{mm:0.001,cm:0.01,m:1,ft:0.3048,in:0.0254,yd:0.9144,km:1000},
  area:{'mm²':0.000001,'cm²':0.0001,'m²':1,'ft²':0.09290304,'in²':0.00064516,'yd²':0.83612736,'acre':4046.8564224,'hectare':10000},
  volume:{'mm³':1e-9,'cm³':1e-6,'m³':1,'ft³':0.028316846592,'in³':0.000016387064,'yd³':0.764554857984,'litre':0.001,'ml':0.000001},
  weight:{mg:0.000001,g:0.001,kg:1,quintal:100,tonne:1000,lb:0.45359237}
};
function convert(){
  const type=$('#convertType').value;
  const f=$('#convertFrom').value;
  const t=$('#convertTo').value;
  const v=Number($('#convertValue').value);
  if(f&&t){
    const result=(Number.isFinite(v)?v:0)*units[type][f]/units[type][t];
    $('#convertResult').textContent=(Number.isFinite(v)?v:0)+' '+f+' = '+result.toFixed(6).replace(/\.?0+$/,'')+' '+t;
  }
}
function fillConverter(){
  const ks=Object.keys(units[$('#convertType').value]);
  $('#convertFrom').innerHTML=ks.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');
  $('#convertTo').innerHTML=ks.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');
  $('#convertTo').selectedIndex=Math.min(1,ks.length-1);
  convert();
}
function calc(){
  const lengthFactors={mm:0.001,cm:0.01,m:1,ft:0.3048,in:0.0254,yd:0.9144};
  const areaFactor=lengthFactors[$('#areaUnit').value]||1;
  const conFactor=lengthFactors[$('#conUnit').value]||1;
  const a=Number($('#areaL').value||0)*Number($('#areaW').value||0)*areaFactor*areaFactor;
  const c=Number($('#conL').value||0)*Number($('#conW').value||0)*Number($('#conD').value||0)*conFactor*conFactor*conFactor;
  const l=Number($('#steelL').value||0)*(lengthFactors[$('#steelUnit').value]||1);
  const kg=(Number($('#steelD').value||0)**2/162)*l;
  $('#areaResult').textContent=a?a.toFixed(3)+' m² · '+(a/0.09290304).toFixed(2)+' ft²':'Enter dimensions';
  $('#conResult').textContent=c?c.toFixed(3)+' m³ · '+(c/0.028316846592).toFixed(2)+' ft³':'Enter dimensions';
  $('#steelResult').textContent=kg?kg.toFixed(2)+' kg · '+(kg/1000).toFixed(3)+' tonne':'Enter size and length';
  convert();
}


/* =========================================================
   ADVANCED CONSTRUCTION CALCULATORS
   ========================================================= */
const geomShapes={
  rectangle:{title:'Rectangle',kind:'2d',metrics:['area','perimeter','volume'],dims:{area:[['length','Length'],['width','Width']],perimeter:[['length','Length'],['width','Width']],volume:[['length','Length'],['width','Width'],['height','Height']]},baseVolume:'rectangle'},
  square:{title:'Square',kind:'2d',metrics:['area','perimeter','volume'],dims:{area:[['side','Side']],perimeter:[['side','Side']],volume:[['side','Side'],['height','Height']]},baseVolume:'square'},
  circle:{title:'Circle',kind:'2d',metrics:['area','perimeter','volume'],perimeterLabel:'Circumference',dims:{area:[['radius','Radius']],perimeter:[['radius','Radius']],volume:[['radius','Radius'],['height','Height']]},baseVolume:'circle'},
  triangle:{title:'Triangle',kind:'2d',metrics:['area','perimeter','volume'],dims:{area:[['a','Side a'],['b','Side b'],['c','Side c']],perimeter:[['a','Side a'],['b','Side b'],['c','Side c']],volume:[['a','Side a'],['b','Side b'],['c','Side c'],['height','Height']]},baseVolume:'triangle'},
  trapezoid:{title:'Trapezoid',kind:'2d',metrics:['area','perimeter','volume'],dims:{area:[['a','Parallel side a'],['b','Parallel side b'],['h','Height']],perimeter:[['a','Parallel side a'],['b','Parallel side b'],['c','Side c'],['d','Side d']],volume:[['a','Parallel side a'],['b','Parallel side b'],['h','Height'],['c','Side c'],['d','Side d'],['height','Height']]},baseVolume:'trapezoid'},
  parallelogram:{title:'Parallelogram',kind:'2d',metrics:['area','perimeter','volume'],dims:{area:[['base','Base'],['side','Side'],['height','Height']],perimeter:[['base','Base'],['side','Side']],volume:[['base','Base'],['side','Side'],['height','Height'],['depth','Depth / Height']]},baseVolume:'parallelogram'},
  rhombus:{title:'Rhombus',kind:'2d',metrics:['area','perimeter','volume'],dims:{area:[['d1','Diagonal 1'],['d2','Diagonal 2']],perimeter:[['side','Side']],volume:[['d1','Diagonal 1'],['d2','Diagonal 2'],['height','Height']]},baseVolume:'rhombus'},
  sector:{title:'Circular Sector',kind:'2d',metrics:['area','perimeter','volume'],perimeterLabel:'Perimeter (arc included)',dims:{area:[['radius','Radius'],['angle','Angle (degrees)']],perimeter:[['radius','Radius'],['angle','Angle (degrees)']],volume:[['radius','Radius'],['angle','Angle (degrees)'],['height','Height']]},baseVolume:'sector'},
  cuboid:{title:'Cuboid',kind:'3d',metrics:['volume','surface'],dims:{volume:[['length','Length'],['width','Width'],['height','Height']],surface:[['length','Length'],['width','Width'],['height','Height']]}},
  cube:{title:'Cube',kind:'3d',metrics:['volume','surface'],dims:{volume:[['side','Side']],surface:[['side','Side']]}},
  cylinder:{title:'Cylinder',kind:'3d',metrics:['volume','surface'],dims:{volume:[['radius','Radius'],['height','Height']],surface:[['radius','Radius'],['height','Height']]}},
  cone:{title:'Cone',kind:'3d',metrics:['volume','surface'],dims:{volume:[['radius','Radius'],['height','Height']],surface:[['radius','Radius'],['height','Height'],['slant','Slant height (optional)']]}},
  sphere:{title:'Sphere',kind:'3d',metrics:['volume','surface'],dims:{volume:[['radius','Radius']],surface:[['radius','Radius']]}},
  hemisphere:{title:'Hemisphere',kind:'3d',metrics:['volume','surface'],dims:{volume:[['radius','Radius']],surface:[['radius','Radius']]}}
};

const geomMetricLabels={area:'Area',perimeter:'Perimeter',volume:'Volume',surface:'Surface Area'};

function updateGeometryMetrics(){
  const type=$('#geometryType')?.value;
  const shape=geomShapes[type];
  const select=$('#geometryMetric');
  if(!shape||!select)return;
  const previous=select.value;
  select.innerHTML=shape.metrics.map(key=>{
    const label=key==='perimeter'&&shape.perimeterLabel?shape.perimeterLabel:geomMetricLabels[key];
    return `<option value="${key}">${esc(label)}</option>`;
  }).join('');
  if(shape.metrics.includes(previous))select.value=previous;
}

function geometryFields(){
  const type=$('#geometryType')?.value;
  const metric=$('#geometryMetric')?.value;
  const shape=geomShapes[type];
  const box=$('#geometryInputs');
  if(!shape||!box)return;
  updateGeometryMetrics();
  const activeMetric=$('#geometryMetric')?.value || metric;
  const dims=shape.dims?.[activeMetric] || [];
  const hint=activeMetric==='volume'&&shape.kind==='2d' ? '<div class="geometry-hint">Volume mode: the selected 2D shape is treated as a prism/extruded solid. Enter the extra height/depth shown below.</div>' : '';
  box.innerHTML=dims.map(([key,label])=>`<label>${esc(label)}<input type="number" min="0" step="any" data-geom="${key}" placeholder="${esc(label)}"></label>`).join('')+
    '<label>Unit<select id="geometryUnit"><option value="mm">mm</option><option value="cm">cm</option><option value="m" selected>m</option><option value="ft">ft</option><option value="in">in</option></select></label>'+hint;
  box.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',calculateGeometry));
  box.querySelector('select')?.addEventListener('change',calculateGeometry);
  calculateGeometry();
}

function calculateGeometry(){
  const type=$('#geometryType')?.value;
  const metric=$('#geometryMetric')?.value;
  const shape=geomShapes[type];
  const unit=$('#geometryUnit')?.value || 'm';
  const factor={mm:.001,cm:.01,m:1,ft:.3048,in:.0254}[unit] || 1;
  const v={};
  document.querySelectorAll('#geometryInputs [data-geom]').forEach(el=>{ const raw=Number(el.value||0); v[el.dataset.geom]=el.dataset.geom==='angle'?raw:raw*factor; });
  let result=null,note='';
  const pi=Math.PI;
  let baseArea=null;

  if(type==='rectangle'){
    if(metric==='area')result=v.length*v.width;
    if(metric==='perimeter')result=2*(v.length+v.width);
    if(metric==='volume')result=v.length*v.width*v.height;
  }
  if(type==='square'){
    if(metric==='area')result=v.side**2;
    if(metric==='perimeter')result=4*v.side;
    if(metric==='volume')result=v.side**2*v.height;
  }
  if(type==='circle'){
    if(metric==='area')result=pi*v.radius**2;
    if(metric==='perimeter')result=2*pi*v.radius;
    if(metric==='volume')result=pi*v.radius**2*v.height;
  }
  if(type==='triangle'){
    const p=(v.a+v.b+v.c)/2;
    baseArea=(v.a+v.b+v.c>0 && p>v.a&&p>v.b&&p>v.c)?Math.sqrt(Math.max(0,p*(p-v.a)*(p-v.b)*(p-v.c))):0;
    if(metric==='area')result=baseArea;
    if(metric==='perimeter')result=v.a+v.b+v.c;
    if(metric==='volume')result=baseArea*v.height;
  }
  if(type==='trapezoid'){
    baseArea=((v.a+v.b)/2)*v.h;
    if(metric==='area')result=baseArea;
    if(metric==='perimeter')result=v.a+v.b+v.c+v.d;
    if(metric==='volume')result=baseArea*v.height;
  }
  if(type==='parallelogram'){
    baseArea=v.base*v.height;
    if(metric==='area')result=baseArea;
    if(metric==='perimeter')result=2*(v.base+v.side);
    if(metric==='volume')result=baseArea*v.depth;
  }
  if(type==='rhombus'){
    baseArea=(v.d1*v.d2)/2;
    if(metric==='area')result=baseArea;
    if(metric==='perimeter')result=4*v.side;
    if(metric==='volume')result=baseArea*v.height;
  }
  if(type==='sector'){
    baseArea=(v.angle/360)*pi*v.radius**2;
    if(metric==='area')result=baseArea;
    if(metric==='perimeter')result=2*v.radius+(v.angle/360)*2*pi*v.radius;
    if(metric==='volume')result=baseArea*v.height;
  }
  if(type==='cuboid'){
    if(metric==='volume')result=v.length*v.width*v.height;
    if(metric==='surface')result=2*(v.length*v.width+v.width*v.height+v.length*v.height);
  }
  if(type==='cube'){
    if(metric==='volume')result=v.side**3;
    if(metric==='surface')result=6*v.side**2;
  }
  if(type==='cylinder'){
    if(metric==='volume')result=pi*v.radius**2*v.height;
    if(metric==='surface')result=2*pi*v.radius*(v.radius+v.height);
  }
  if(type==='cone'){
    if(metric==='volume')result=pi*v.radius**2*v.height/3;
    if(metric==='surface'){
      const sl=v.slant>0?v.slant:Math.sqrt(v.radius**2+v.height**2);
      result=pi*v.radius*(v.radius+sl);
      note='Slant height used: '+sl.toFixed(4)+' m';
    }
  }
  if(type==='sphere'){
    if(metric==='volume')result=4*pi*v.radius**3/3;
    if(metric==='surface')result=4*pi*v.radius**2;
  }
  if(type==='hemisphere'){
    if(metric==='volume')result=2*pi*v.radius**3/3;
    if(metric==='surface')result=3*pi*v.radius**2;
  }
  const out=$('#geometryResult'); if(!out)return;
  const f=n=>Number(n||0).toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1');
  if(result===null || !Number.isFinite(result) || result<=0){
    out.innerHTML='<span>Enter all required dimensions above.</span>';
    return;
  }
  let resultUnit='m';
  if(metric==='area'||metric==='surface')resultUnit='m²';
  if(metric==='volume')resultUnit='m³';
  const label=metric==='perimeter'&&shape?.perimeterLabel?shape.perimeterLabel:(geomMetricLabels[metric]||'Result');
  out.innerHTML=`<b>${esc(label)}:</b> ${f(result)} ${resultUnit}${note?' &nbsp; | &nbsp; '+esc(note):''}<small>All dimensions are converted to metres internally.</small>`;
}

function clearGeometryCalculator(){
  document.querySelectorAll('#geometryInputs [data-geom]').forEach(el=>el.value='');
  calculateGeometry();
}

function openScientificCalculator(){
  const modal=$('#scientificModal');
  if(modal)modal.classList.add('show');
  $('#scientificDisplay')?.focus();
}
function closeScientificCalculator(){
  $('#scientificModal')?.classList.remove('show');
}
function scientificEvaluate(expression){
  let x=String(expression||'').trim();
  if(!x)return '';
  if(x.length>180)throw new Error('Expression too long');
  if(!/^[0-9+\-*/%^().,\sA-Za-zπ]+$/.test(x))throw new Error('Unsupported character');
  x=x.replaceAll('π','Math.PI').replace(/\bpi\b/gi,'Math.PI');
  const names={
    sin:'(n)=>Math.sin(n*Math.PI/180)',cos:'(n)=>Math.cos(n*Math.PI/180)',tan:'(n)=>Math.tan(n*Math.PI/180)',
    asin:'(n)=>Math.asin(n)*180/Math.PI',acos:'(n)=>Math.acos(n)*180/Math.PI',atan:'(n)=>Math.atan(n)*180/Math.PI',
    sqrt:'Math.sqrt',cbrt:'Math.cbrt',abs:'Math.abs',floor:'Math.floor',ceil:'Math.ceil',round:'Math.round',
    log:'Math.log10',ln:'Math.log',exp:'Math.exp',pow:'Math.pow'
  };
  Object.keys(names).forEach(name=>{x=x.replace(new RegExp('\\b'+name+'\\s*\\(','gi'),'__FN_'+name+'__(');});
  x=x.replace(/\^/g,'**');
  const env={Math};
  Object.keys(names).forEach(name=>env['__FN_'+name+'__']=eval(names[name]));
  const keys=Object.keys(env),vals=keys.map(k=>env[k]);
  const result=Function(...keys,'"use strict"; return ('+x+');')(...vals);
  if(typeof result!=='number'||!Number.isFinite(result))throw new Error('Invalid result');
  return result;
}
function setupScientificCalculator(){
  const display=$('#scientificDisplay');
  if(!display)return;
  const output=$('#scientificResult');
  const insert=v=>{display.value+=(v==='×'?'*':v==='÷'?'/':v);display.focus();};
  $$('#scientificModal [data-sci]').forEach(btn=>btn.addEventListener('click',()=>{
    const v=btn.dataset.sci;
    if(v==='clear'){display.value='';output.textContent='0';return;}
    if(v==='back'){display.value=display.value.slice(0,-1);return;}
    if(v==='equals'){try{output.textContent=String(scientificEvaluate(display.value));}catch(e){output.textContent='Error';}return;}
    insert(v);
  }));
  display.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();try{output.textContent=String(scientificEvaluate(display.value));}catch{output.textContent='Error';}}});
  $('#scientificOpen')?.addEventListener('click',openScientificCalculator);
  $('#scientificClose')?.addEventListener('click',closeScientificCalculator);
  $('#scientificModal')?.addEventListener('click',e=>{if(e.target.id==='scientificModal')closeScientificCalculator();});
}



function fields(k){
  let projects=activeSites()
    .map(x=>'<option>'+esc(x)+'</option>')
    .join('');

  let base=
    '<label>Date<input name="date" type="date" value="'+today+'" required></label>'+
    '<label>Project<select name="site" required>'+projects+'</select></label>';

  if(k==='project')
    return '<label class="full">Project / site name<input name="project" placeholder="e.g. Sector 62 Commercial Tower" required></label>';

if(k==='profile'){
  const pName=esc(currentProfile.name||'');
  const pDesignation=esc(currentProfile.designation||'');
  const pImage=typeof currentProfile.image==='string' ? currentProfile.image.trim() : '';
  const avatarStyle=pImage
    ? 'style="background-image:url(\''+pImage.replace(/'/g,'%27')+'\');background-size:cover;background-position:center;"'
    : '';
  const initials=esc((currentProfile.name||'Profile').trim().charAt(0).toUpperCase());
  return '<div class="profile-editor">'+
    '<div class="profile-editor-hero">'+
      '<div class="profile-avatar-wrap"><div class="profile-avatar-preview" '+avatarStyle+'>'+(!pImage?initials:'')+'</div><span class="profile-avatar-status">✓</span></div>'+
      '<div class="profile-editor-copy">'+
        '<span class="profile-editor-kicker">✦ ENTRY PROFILE</span>'+
        '<h3>Personalize your workspace</h3>'+
        '<p>Your profile identity is shown across records, reports and the “Created by” field.</p>'+
        '<div class="profile-live-chip"><span>●</span> Profile preview is live</div>'+
      '</div>'+
      '<div class="profile-hero-decoration" aria-hidden="true"><span></span><span></span><span></span></div>'+
    '</div>'+
    '<div class="profile-editor-body">'+
      '<div class="profile-section-title"><span class="profile-section-icon">👤</span><div><b>Personal information</b><small>Keep your name and designation up to date.</small></div></div>'+
      '<div class="profile-editor-fields">'+
        '<label><span>Full name</span><input name="name" value="'+pName+'" placeholder="Enter your full name" required><small>Displayed as your creator name.</small></label>'+
        '<label><span>Designation</span><input name="designation" value="'+pDesignation+'" placeholder="e.g. Store In-charge / Engineer" required><small>Displayed beside your name.</small></label>'+
        '<label class="full profile-photo-field"><span>Profile photo</span><div class="profile-upload-box"><span class="profile-upload-icon">📷</span><div><b>Choose a profile photo</b><small>Optional · JPG, PNG or WebP</small></div><input name="profileImage" type="file" accept="image/*"></div></label>'+
      '</div>'+
      '<div class="profile-preview-card"><div class="profile-preview-mini" '+avatarStyle+'>'+(!pImage?initials:'')+'</div><div><small>PREVIEW</small><b class="profile-preview-name">'+(pName||'Your Name')+'</b><span class="profile-preview-designation">'+(pDesignation||'Your Designation')+'</span></div><span class="profile-preview-check">✓</span></div>'+
      '<div class="profile-editor-note"><span>✓</span><div><b>Used for “Created by”</b><small>Records will show your profile name and designation instead of a technical user ID.</small></div></div>'+
    '</div>'+
  '</div>';
}

  if(!activeSites().length)
    return '<p class="full">Please add or reopen an active project first.</p>';

  if(k==='concrete')
    return base+
      '<label>Challan / Change No.<input name="challan" placeholder="e.g. CH-001" required></label>'+
      '<label>Contractor<input name="contractor" placeholder="Contractor name" required></label>'+

      '<label>Length'+
        '<div class="unit-input">'+
          '<input name="length" type="number" step="any" min="0" required placeholder="Length">'+
          '<select name="lengthUnit">'+
            '<option value="m">m</option>'+
            '<option value="cm">cm</option>'+
            '<option value="mm">mm</option>'+
            '<option value="ft">ft</option>'+
            '<option value="in">in</option>'+
            '<option value="yd">yd</option>'+
          '</select>'+
        '</div>'+
      '</label>'+

      '<label>Width'+
        '<div class="unit-input">'+
          '<input name="width" type="number" step="any" min="0" required placeholder="Width">'+
          '<select name="widthUnit">'+
            '<option value="m">m</option>'+
            '<option value="cm">cm</option>'+
            '<option value="mm">mm</option>'+
            '<option value="ft">ft</option>'+
            '<option value="in">in</option>'+
            '<option value="yd">yd</option>'+
          '</select>'+
        '</div>'+
      '</label>'+

      '<label>Height / Depth'+
        '<div class="unit-input">'+
          '<input name="height" type="number" step="any" min="0" required placeholder="Height / Depth">'+
          '<select name="heightUnit">'+
            '<option value="m">m</option>'+
            '<option value="cm">cm</option>'+
            '<option value="mm">mm</option>'+
            '<option value="ft">ft</option>'+
            '<option value="in">in</option>'+
            '<option value="yd">yd</option>'+
          '</select>'+
        '</div>'+
      '</label>'+

      '<label>Rate / m³ (₹)'+
        '<input name="rate" type="number" step="any" min="0" required placeholder="₹ per m³">'+
      '</label>'+      '<div class="concrete-calculation full">'+        '<div><small>Calculated Concrete</small><strong class="concrete-volume-preview">0.000 m³</strong></div>'+        '<div><small>Total Amount</small><strong class="concrete-total-preview">₹0</strong></div>'+      '</div>';

  if(k==='stock')
    return base+
      '<label>Entry type<select name="type"><option>Receive</option><option>Issue</option><option>Return</option></select></label>'+
      '<label>Material name<input name="material" required></label>'+
      '<label>Quantity<input name="qty" type="number" step=".01" min="0" required></label>'+
      '<label>Unit<select name="unit"><option>Bags</option><option>Kg</option><option>Ton</option><option>CFT</option><option>Nos</option><option>Litre</option></select></label>'+
      '<label>Contractor name<input name="contractor" placeholder="For issue / return"></label>'+
      '<label>Store in-charge<input name="incharge" required></label>'+
      '<label class="full">Rate per unit (₹)<input name="rate" type="number" step=".01" min="0" required></label>';

  if(k==='oil')
    return base+
      '<label>Entry type<select name="type"><option>Receive</option><option>Issue</option></select></label>'+
      '<label>Fuel<select name="fuel"><option>Diesel</option><option>Petrol</option><option>Engine Oil</option></select></label>'+
      '<label>Litres<input name="litres" type="number" step=".01" min="0" required></label>'+
      '<label>Machine / vehicle<input name="machine" required></label>'+
      '<label>Meter / hours<input name="reading" type="number" step=".01"></label>'+
      '<label>Driver / operator<input name="operator" required></label>'+
      '<label class="full">Rate per litre (₹)<input name="rate" type="number" step=".01" min="0" required></label>';

  if(k==='labour')
    return base+
      '<label>Contractor<input name="contractor" required></label>'+
      '<label>Work / trade<input name="trade" required></label>'+
      '<label>Skilled labour<input name="skilled" type="number" min="0" value="0" required></label>'+
      '<label>Unskilled labour<input name="unskilled" type="number" min="0" value="0" required></label>'+
      '<label class="full">Daily rate per person (₹)<input name="rate" type="number" min="0" required></label>';

return base+
  '<label>Contractor<input name="contractor" required></label>'+
  '<label>Work item<input name="work" required></label>'+
  '<label>Quantity / Area / Volume<input name="qty" type="number" step=".01" min="0" required></label>'+
  '<label>Unit<select name="unit">'+
    '<option>sq ft</option>'+
    '<option>sq m</option>'+
    '<option>m³</option>'+
    '<option>CFT</option>'+
    '<option>Rft</option>'+
    '<option>Ton</option>'+
    '<option>Nos</option>'+
  '</select></label>'+
  '<label>Rate (₹)<input name="rate" type="number" step=".01" min="0" required></label>'+
  '<label>Amount paid (₹)<input name="paid" type="number" min="0" value="0" required></label>';}


function open(k,record){
if(['stock','oil','labour','bill'].includes(k)&&!profile()){    open('profile');
    return;
  }

  const titles={
    project:'Add project / site',
    profile:'Edit Profile',
    stock:'Material stock entry',
    oil:'Oil & machine entry',
    labour:'Daily labour attendance',
    bill:'Create work bill',
    concrete:'Add Concrete Details'
  };

  $('#modalTitle').textContent=(record?'Edit: ':'')+(titles[k]||'Entry');
  const f=$('#entryForm');
  f.innerHTML=fields(k)+'<button class="primary submit" type="submit">Save / सेव करें</button>';
  f.dataset.kind=k;
  f.dataset.id=record?record.id:'';

  if(k==='profile'){
    const nameInput=f.elements.name;
    const avatar=f.querySelector('.profile-avatar-preview');
    const fileInput=f.elements.profileImage;
    const syncProfilePreview=()=>{
      const name=(nameInput?.value||'').trim();
      if(avatar && !avatar.style.backgroundImage) avatar.textContent=(name.charAt(0)||'P').toUpperCase();
      const copy=f.querySelector('.profile-editor-copy h3');
      if(copy) copy.textContent=name ? 'Welcome, '+name : 'Personalize your workspace';
      const mini=f.querySelector('.profile-preview-mini');
      const miniName=f.querySelector('.profile-preview-name');
      const miniRole=f.querySelector('.profile-preview-designation');
      if(mini && !mini.style.backgroundImage) mini.textContent=(name.charAt(0)||'P').toUpperCase();
      if(miniName) miniName.textContent=name||'Your Name';
      if(miniRole) miniRole.textContent=(f.elements.designation?.value||'').trim()||'Your Designation';
    };
    nameInput?.addEventListener('input',syncProfilePreview);
    f.elements.designation?.addEventListener('input',syncProfilePreview);
    fileInput?.addEventListener('change',()=>{
      const file=fileInput.files?.[0];
      if(!file || !avatar)return;
      const reader=new FileReader();
      reader.onload=()=>{
        const src=String(reader.result).replace(/\"/g,'%22');
        avatar.textContent='';avatar.style.backgroundImage='url(\"'+src+'\")';avatar.style.backgroundSize='cover';avatar.style.backgroundPosition='center';
        const mini=f.querySelector('.profile-preview-mini');
        if(mini){mini.textContent='';mini.style.backgroundImage='url(\"'+src+'\")';mini.style.backgroundSize='cover';mini.style.backgroundPosition='center';}
      };
      reader.readAsDataURL(file);
    });
    syncProfilePreview();
  }

  if(record){
    Object.keys(record).forEach(key=>{
      if(f.elements[key]) f.elements[key].value=record[key];
    });
  }

  if(k==='concrete') setupConcreteForm(f,record);
  $('#modal').classList.add('show');
}


const concreteUnits={m:1,cm:0.01,mm:0.001,ft:0.3048,in:0.0254,yd:0.9144};
function concreteToMetres(value,unit){return Number(value||0)*(concreteUnits[unit]||1)}
function concreteVolumeFromForm(form){
  const l=concreteToMetres(form.elements.length?.value,form.elements.lengthUnit?.value);
  const w=concreteToMetres(form.elements.width?.value,form.elements.widthUnit?.value);
  const h=concreteToMetres(form.elements.height?.value,form.elements.heightUnit?.value);
  return l*w*h;
}
function updateConcretePreview(form){
  const volume=concreteVolumeFromForm(form);
  const rate=Number(form.elements.rate?.value||0);
  const v=form.querySelector('.concrete-volume-preview');
  const t=form.querySelector('.concrete-total-preview');
  if(v) v.textContent=volume.toFixed(3)+' m³';
  if(t) t.textContent=money(volume*rate);
}
function setupConcreteForm(form,record){
  const inputs=[
    'concreteLength',
    'concreteWidth',
    'concreteHeight',
    'lengthUnit',
    'widthUnit',
    'heightUnit',
    'rate'
  ];

  inputs.forEach(name=>{
    const el=form.elements[name];
    if(el && typeof el.addEventListener==='function'){
      el.addEventListener('input',()=>updateConcretePreview(form));
      el.addEventListener('change',()=>updateConcretePreview(form));
    }
  });

  updateConcretePreview(form);
}



function renderConcrete(){
  const list=data('concrete');
  const count=$('#concreteCount');
  if(count) count.textContent=list.length+' entries';
  const rows=list.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(x=>{
    const volume=Number(x.volume||0);
    return '<tr>'+      '<td>'+dateText(x.date)+'</td>'+      '<td>'+esc(x.challan||'—')+'</td>'+      '<td>'+esc(x.site||'—')+'</td>'+      '<td>'+esc(x.contractor||'—')+'</td>'+      '<td>'+Number(x.length||0)+' '+esc(x.lengthUnit||'m')+'</td>'+      '<td>'+Number(x.width||0)+' '+esc(x.widthUnit||'m')+'</td>'+      '<td>'+Number(x.height||0)+' '+esc(x.heightUnit||'m')+'</td>'+      '<td><b>'+volume.toFixed(3)+' m³</b></td>'+      '<td>'+money(x.rate)+'</td>'+      '<td>'+money(x.total)+'</td>'+      '<td>'+esc(profile()||'—')+'</td>'+      '<td>'+actions('concrete',x.id)+'</td>'+      '</tr>';
  }).join('');
  const el=$('#concreteList');
  if(el) el.innerHTML=table(['Date','Challan / Change No.','Project','Contractor','Length','Width','Height / Depth','Concrete','Rate / m³','Total','Created by','Action'],rows);
}









function report(){

  const type=$('#reportType').value;

  const site=$('#reportSite').value || 'All Projects';

  const contractor=$('#reportContractor').value || 'All Contractors';

  const from=$('#reportFrom').value;

  const to=$('#reportTo').value;


  const ok=x=>
    (site==='All Projects'||x.site===site) &&
    (contractor==='All Contractors'||x.contractor===contractor) &&
    (!from||x.date>=from) &&
    (!to||x.date<=to);


  /* Material register */

  if(type==='stock'){

    return {
      n:'Material register',

      h:[
        'Date',
        'Type',
        'Material',
        'Qty',
        'Project',
        'Contractor',
        'Created by'
      ],

      r:db.stock
        .filter(ok)
        .map(x=>[
          dateText(x.date),
          x.type,
          x.material,
          x.qty+' '+x.unit,
          x.site,
          x.contractor||'—',
          profile()||'—'
        ])
    };

  }


  /* Oil register
     Oil records do not have a contractor field.
     Therefore contractor-wise oil filtering is not possible.
  */

  if(type==='oil'){

    const oilOk=x=>
      (site==='All Projects'||x.site===site) &&
      (contractor==='All Contractors') &&
      (!from||x.date>=from) &&
      (!to||x.date<=to);

    return {
      n:'Oil register',

      h:[
        'Date',
        'Type',
        'Fuel',
        'Litres',
        'Machine',
        'Project',
        'Created by'
      ],

      r:db.oil
        .filter(oilOk)
        .map(x=>[
          dateText(x.date),
          x.type,
          x.fuel,
          x.litres+' L',
          x.machine,
          x.site,
          profile()||'—'
        ])
    };

  }


  /* Attendance register */

  if(type==='labour'){

    return {
      n:'Attendance register',

      h:[
        'Date',
        'Project',
        'Contractor',
        'Trade',
        'Skilled',
        'Unskilled',
        'Created by'
      ],

      r:db.labour
        .filter(ok)
        .map(x=>[
          dateText(x.date),
          x.site,
          x.contractor,
          x.trade,
          x.skilled,
          x.unskilled,
          profile()||'—'
        ])
    };

  }


  /* Concrete register */

  if(type==='concrete'){

    return {
      n:'Concrete register',

      h:[
        'Date',
        'Challan / Change No.',
        'Project',
        'Contractor',
        'Concrete m³',
        'Rate / m³',
        'Total',
        'Created by'
      ],

      r:db.concrete
        .filter(ok)
        .map(x=>[
          dateText(x.date),
          x.challan||'—',
          x.site,
          x.contractor||'—',
          Number(x.volume||0).toFixed(3),
          money(x.rate),
          money(x.total),
          profile()||'—'
        ])
    };

  }


  /* Contractor ledger */

  return {

    n:'Contractor ledger',

    h:[
      'Date',
      'Type',
      'Contractor',
      'Project',
      'Material',
      'Qty',
      'Unit',
      'Rate',
      'Amount',
      'Store In-charge',
      'Created By'
    ],

    r:contractorLedgerDetails(
      site,
      from,
      to,
      contractor
    )

  };

}













function generate(){let r=report(),range=($('#reportFrom').value?dateText($('#reportFrom').value):'Start')+' to '+($('#reportTo').value?dateText($('#reportTo').value):'Today');$('#reportOutput').innerHTML='<div class="report-title"><h3>AMC SiteFlow · '+r.n+'</h3><p>'+esc($('#reportSite').value||'All Projects')+' · '+range+'</p></div>'+table(r.h,r.r.map(a=>'<tr>'+a.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join(''))+'<div class="signature">Created by: <b>'+esc(profile()||'Not set')+'</b> · Generated: '+dateText(today)+'</div>'}
function csv(){let r=report(),text=[r.h,...r.r].map(a=>a.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv'}));a.download='AMC-'+r.n.replaceAll(' ','-')+'.csv';a.click()}
function png(){generate();let lines=$('#reportOutput').innerText.split('\n').filter(Boolean),c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=1200;c.height=Math.max(400,lines.length*30+90);ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#0c6b43';ctx.font='bold 28px Arial';ctx.fillText('AMC SiteFlow Report',40,45);ctx.fillStyle='#17231d';ctx.font='16px Arial';lines.forEach((x,i)=>ctx.fillText(x.slice(0,140),40,90+i*28));let a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='AMC-SiteFlow-report.png';a.click()}
function recordList(kind){
  return db[kind==='bill'?'bills':kind]
}

function bindRecordActions(){

  if(window.amcRecordActionsBound) return;
  window.amcRecordActionsBound=true;

  document.addEventListener('click',async e=>{

    const editUserBtn=e.target.closest('[data-edit-user]');
    if(editUserBtn){
      if(userRole!=='admin'){ alert('Only Admin can edit users.'); return; }
      const uid=editUserBtn.dataset.editUser;
      try{
        const snap=await getDoc(doc(firestoreDb,'users',uid));
        const user=snap.exists()?{id:uid,...snap.data()}:(uid===currentUser?.uid?{id:uid,name:currentUser.displayName,email:currentUser.email,role:'admin',status:'active'}:null);
        if(user) openUserEditor(user);
      }catch(error){
        console.error('Open user editor error:',error);
        alert('Could not load this user.');
      }
      return;
    }

    const deleteUserBtn=e.target.closest('[data-delete-user]');
    if(deleteUserBtn){
      await deleteManagedUser(deleteUserBtn.dataset.deleteUser);
      return;
    }

    const editBtn=e.target.closest('[data-edit]');
    if(editBtn){

      let row=recordList(editBtn.dataset.edit)
        .find(x=>x.id===editBtn.dataset.id);

      if(row){
        open(editBtn.dataset.edit,row);
      }

      return;
    }

    const deleteBtn=e.target.closest('[data-delete]');
    if(deleteBtn){console.log("DELETE BUTTON CLICKED", {
  role:userRole,
  kind:deleteBtn.dataset.delete,
  id:deleteBtn.dataset.id
});

      if(userRole!=='admin'){
        alert('Only Admin can delete records.');
        return;
      }

      if(confirm('Delete this entry permanently? This cannot be undone.')){

        let list=recordList(deleteBtn.dataset.delete);
        let i=list.findIndex(x=>x.id===deleteBtn.dataset.id);

        if(i>=0){
          list.splice(i,1);
          await save();
          all();
        }
      }

      return;
    }

    const contractorBtn=e.target.closest('[data-delete-contractor]');
    if(contractorBtn){

      if(userRole!=='admin'){
        alert('Only Admin can delete records.');
        return;
      }

      let name=contractorBtn.dataset.deleteContractor;

      if(confirm('Delete ALL material, labour and bill records for '+name+'? This cannot be undone.')){

        db.stock=db.stock.filter(x=>x.contractor!==name);
        db.labour=db.labour.filter(x=>x.contractor!==name);
        db.bills=db.bills.filter(x=>x.contractor!==name);
        db.concrete=db.concrete.filter(x=>x.contractor!==name);

        await save();
        all();
      }

      return;
    }

    const completeBtn=e.target.closest('[data-complete-project]');
    if(completeBtn){

      if(userRole !== 'admin'){
        alert('Only Admin can complete or reopen projects.');
        return;
      }

      let name=completeBtn.dataset.completeProject;
      let i=db.completedProjects.indexOf(name);

      if(i>=0)
        db.completedProjects.splice(i,1);
      else
        db.completedProjects.push(name);

      await save();
      all();

      return;
    }

    const projectBtn=e.target.closest('[data-delete-project]');
    if(projectBtn){

      if(userRole!=='admin'){
        alert('Only Admin can delete records.');
        return;
      }

      let name=projectBtn.dataset.deleteProject;

      if(confirm('Delete project '+name+' and ALL of its material, oil, labour and bill records? This cannot be undone.')){

        db.sites=db.sites.filter(x=>x!==name);
        db.completedProjects=db.completedProjects.filter(x=>x!==name);

        ['stock','oil','labour','bills','concrete'].forEach(k=>{
          db[k]=db[k].filter(x=>x.site!==name);
        });

        await save();
        all();
      }

      return;
    }

  });
}



function all(){

  refreshSelects();

  dashboard();
  dashboardExtras();
  renderStock();
  renderOil();
  renderConcrete();
  attendance();
  billing();
  calc();
  generate();
  bindRecordActions();

}






function go(v){$$('#nav button,.view').forEach(x=>x.classList.remove('active'));$('#nav [data-view="'+v+'"]').classList.add('active');$('#'+v).classList.add('active');$('#pageTitle').textContent=$('#nav [data-view="'+v+'"]').textContent.trim();$('.sidebar').classList.remove('open');if(v==='userManagement'&&userRole==='admin')loadUserManagement();}
$('#siteFilter').onchange=all;
$('#menu').onclick=()=>$('.sidebar').classList.toggle('open');
$('#quickAdd').onclick=()=>open('stock');
$('#addProject').onclick=()=>open('project');
$('#welcomeProject').onclick=()=>open('project');
$('#profileButton').onclick=()=>open('profile');


$$('[data-modal]').forEach(x=>{
  x.onclick = function(e){
    e.preventDefault();
    e.stopPropagation();
    open(x.dataset.modal);
  };
});

const addConcreteButton = document.getElementById('addConcreteButton');

if(addConcreteButton){
  addConcreteButton.onclick = function(e){
    e.preventDefault();
    e.stopPropagation();
    open('concrete');
  };
}


$$('[data-go]').forEach(x=>x.onclick=()=>go(x.dataset.go));$$('#nav button').forEach(x=>x.onclick=()=>go(x.dataset.view));$('#closeModal').onclick=()=>$('#modal').classList.remove('show');$('#modal').onclick=e=>{if(e.target===$('#modal'))$('#modal').classList.remove('show')};$$('.tab[data-stocktab]').forEach(x=>x.onclick=()=>{$('.tab[data-stocktab].active').classList.remove('active');x.classList.add('active');stockTab=x.dataset.stocktab;renderStock()});$$('.tab[data-oiltab]').forEach(x=>x.onclick=()=>{$('.tab[data-oiltab].active').classList.remove('active');x.classList.add('active');oilTab=x.dataset.oiltab;renderOil()});$('#attendanceDate').onchange=attendance;$('#attendanceSite').onchange=attendance;$('#billDate').onchange=billing;$('#billContractor').onchange=billing;$('#billSite').onchange=billing;$$('#calculator input,#calculator select').forEach(x=>x.oninput=calc);$('#convertType').onchange=fillConverter;$('#generateReport').onclick=generate;$('#exportExcel').onclick=csv;$('#exportPng').onclick=png;$('#exportPdf').onclick=()=>{generate();window.print()};$('#shareReport').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);alert('Link copied. Online shared live data needs cloud database setup.')}catch{prompt('Copy this link:',location.href)}};$('#downloadBackup').onclick=downloadBackup;$('#restoreBackup').onclick=restoreBackup;
$('#entryForm').onsubmit=async e=>{
  e.preventDefault();
  const k=e.target.dataset.kind;
  const o=Object.fromEntries(new FormData(e.target));
  const id=e.target.dataset.id;

  if(k==='project'){
    const name=o.project.trim();
    const exists=db.sites.some(x=>x.toLowerCase()===name.toLowerCase());
    if(exists){alert('This project/site name already exists. Duplicate project was not added.');return;}
    db.sites.push(name);
 



}else if(k==='profile'){

  if(!currentUser || !currentUser.uid){
    alert('User account not available. Please login again.');
    return;
  }

  const imageFile =
    e.target.querySelector(
      'input[name="profileImage"]'
    )?.files?.[0];

  let image =
    currentProfile.image || '';

  if(imageFile){
    image =
      await compressProfileImage(
        imageFile
      );
  }

  currentProfile = {
    name: o.name.trim(),
    designation: o.designation.trim(),
    image: image
  };

  await setDoc(
    doc(
      firestoreDb,
      'profiles',
      currentUser.uid
    ),
    {
      name: currentProfile.name,
      designation: currentProfile.designation,
      image: currentProfile.image,
      updatedAt: new Date().toISOString()
    }
  );

  refreshSelects();

  alert('Profile saved successfully.');

}else if(k==='concrete'){


    const volume=concreteVolumeFromForm(e.target);
    const rate=Number(o.rate||0);
    if(volume<=0){alert('Length, Width and Height / Depth must be greater than 0.');return;}
    o.length=Number(o.length||0); o.width=Number(o.width||0); o.height=Number(o.height||0); o.rate=rate;
    o.volume=Number(volume.toFixed(6));
    o.total=Number((volume*rate).toFixed(2));
    o.createdBy=undefined;
    const list=db.concrete||[];
    const old=list.find(x=>x.id===id);
    if(old){Object.assign(old,o,{createdBy:old.createdBy||profile()});}
    else{o.id=crypto.randomUUID();o.createdBy=profile();list.unshift(o);db.concrete=list;}
  }else{
    ['qty','rate','litres','reading','skilled','unskilled','paid'].forEach(x=>{if(x in o)o[x]=Number(o[x]||0)});
    const list=recordList(k),old=list.find(x=>x.id===id);
    if(old){Object.assign(old,o,{createdBy:old.createdBy});}
    else{o.id=crypto.randomUUID();o.createdBy=profile();list.unshift(o);}
  }

  await save();
  $('#modal').classList.remove('show');
  all();
};

fillConverter();
setupScientificCalculator();
$('#geometryType')?.addEventListener('change',geometryFields);
$('#geometryMetric')?.addEventListener('change',geometryFields);
$('#geometryClear')?.addEventListener('click',clearGeometryCalculator);
geometryFields();














// ===============================
// USER MANAGEMENT - FINAL
// ===============================

async function loadUserManagement(){

  const userList = $('#userList');

  if(!userList) return;

  if(userRole !== 'admin'){
    userList.innerHTML = '<tr><td colspan="5">Only Admin can view users.</td></tr>';
    return;
  }

  userList.innerHTML = '<tr><td colspan="5">Loading users...</td></tr>';

  try{
    const snapshot = await getDocs(collection(firestoreDb, 'users'));
    const users=[];
    snapshot.forEach(userDoc=>users.push({id:userDoc.id,...userDoc.data()}));

    // Always show the currently signed-in admin even if a profile document
    // was created later than the Auth account.
    if(currentUser && !users.some(x=>x.id===currentUser.uid)){
      users.push({
        id:currentUser.uid,
        name:currentUser.displayName || '',
        email:currentUser.email || '',
        role:'admin',
        status:'active'
      });
    }

    users.sort((a,b)=>String(a.name||a.email||'').localeCompare(String(b.name||b.email||'')));

    if(!users.length){
      userList.innerHTML='<tr><td colspan="5">No users found.</td></tr>';
      return;
    }

    userList.innerHTML=users.map(user=>{
      const isCurrent=user.id===currentUser?.uid;
      return `
        <tr>
          <td>${esc(user.name || '—')}</td>
          <td>${esc(user.email || '—')}</td>
          <td><strong>${esc(user.role || 'user')}</strong></td>
          <td>${esc(user.status || 'active')}</td>
          <td>
            <div class="user-actions">
              <button type="button" class="record-action edit" data-edit-user="${esc(user.id)}">Edit</button>
              <button type="button" class="record-action remove" data-delete-user="${esc(user.id)}">Delete</button>
              ${isCurrent ? '<span class="current-user-badge">Current Admin</span>' : ''}
            </div>
          </td>
        </tr>`;
    }).join('');

  }catch(error){
    console.error('User list load error:',error);
    userList.innerHTML='<tr><td colspan="5">Unable to load users.</td></tr>';
  }
}

function openUserEditor(user){
  if(userRole!=='admin'){
    alert('Only Admin can edit users.');
    return;
  }
  const form=$('#userForm');
  const box=$('#addUserForm');
  if(!form || !box) return;

  $('#userName').value=user.name || '';
  $('#userEmail').value=user.email || '';
  $('#userEmail').readOnly=true;
  $('#userRole').value=user.role || 'user';
  $('#userStatus').value=user.status || 'active';
  $('#userPassword').value='';
  $('#userPasswordConfirm').value='';
  $('#editingUserId').value=user.id;
  $('#userFormMode').textContent='Edit User';
  $('#saveUserButton').textContent='💾 Update User';
  $('#userPasswordHint').textContent='Password change is handled by Firebase account security and is not changed from this profile editor.';
  box.style.display='block';
  box.scrollIntoView({behavior:'smooth',block:'center'});
}

function resetUserForm(){
  const form=$('#userForm');
  if(!form) return;
  form.reset();
  $('#editingUserId').value='';
  $('#userRole').value='user';
  $('#userStatus').value='active';
  $('#userFormMode').textContent='Add New User';
  $('#saveUserButton').textContent='💾 Save User';
  $('#userEmail').readOnly=false;
  $('#userPassword').style.display='';
  $('#userPasswordConfirm').style.display='';
  $('#userPasswordHint').textContent='Minimum 6 characters.';
}

async function deleteManagedUser(uid){
  if(userRole!=='admin'){
    alert('Only Admin can delete users.');
    return;
  }
  const isSelf=uid===currentUser?.uid;
  const message=isSelf
    ? 'Delete your own Admin account permanently?\n\nThis will remove the Firebase login account and its User Management profile. You will be logged out.'
    : 'Delete this user permanently?\n\nThe Firebase login account and its User Management profile will be removed.';
  if(!confirm(message)) return;

  try{
    const result=await adminDeleteUser({uid});
    alert(result?.data?.message || 'User deleted successfully.');
    if(isSelf){
      await signOut(auth);
      window.location.replace('login.html');
      return;
    }
    await loadUserManagement();
  }catch(error){
    console.error('Delete user error:',error);
    const code=error?.code || '';
    const detail=error?.message || 'Could not delete user.';
    alert('User delete failed.\n\n'+(code ? code+'\n' : '')+detail);
  }
}


const addUserButton = $('#addUserButton');
const addUserForm = $('#addUserForm');
const cancelUserButton = $('#cancelUserButton');
const userForm = $('#userForm');

if(addUserButton && addUserForm){
  addUserButton.addEventListener('click',()=>{
    if(userRole!=='admin'){
      alert('Only Admin can create users.');
      return;
    }
    resetUserForm();
    addUserForm.style.display='block';
    $('#userName')?.focus();
  });
}

if(cancelUserButton && addUserForm && userForm){
  cancelUserButton.addEventListener('click',()=>{
    resetUserForm();
    addUserForm.style.display='none';
  });
}

if(userForm){
  userForm.addEventListener('submit',async event=>{
    event.preventDefault();

    if(userRole!=='admin'){
      alert('Only Admin can manage users.');
      return;
    }

    const editingId=$('#editingUserId')?.value.trim() || '';
    const name=$('#userName')?.value.trim() || '';
    const email=$('#userEmail')?.value.trim().toLowerCase() || '';
    const password=$('#userPassword')?.value || '';
    const passwordConfirm=$('#userPasswordConfirm')?.value || '';
    const role=$('#userRole')?.value || 'user';
    const status=$('#userStatus')?.value || 'active';

    if(!name || !email){
      alert('Please fill name and email.');
      return;
    }
    if(role!=='admin' && role!=='user'){
      alert('Invalid user role.'); return;
    }
    if(status!=='active' && status!=='inactive'){
      alert('Invalid user status.'); return;
    }

    const saveButton=$('#saveUserButton');
    if(saveButton){ saveButton.disabled=true; saveButton.textContent=editingId?'Updating User...':'Creating User...'; }

    try{
      if(editingId){
        const existingRef=doc(firestoreDb,'users',editingId);
        const existingSnap=await getDoc(existingRef);
        const existing=existingSnap.exists()?existingSnap.data():{};

        await setDoc(existingRef,{
          ...existing,
          name,
          email:existing.email || email,
          role,
          status,
          updatedAt:new Date().toISOString(),
          updatedBy:currentUser?.uid || ''
        },{merge:true});

        // Keep the signed-in Admin's Firebase display name in sync.
        if(editingId===currentUser?.uid){
          try{ await updateProfile(currentUser,{displayName:name}); }catch(profileError){ console.warn('Display name update skipped:',profileError); }
        }

        resetUserForm();
        addUserForm.style.display='none';
        await loadUserManagement();
        all();
        alert('User updated successfully.');
        return;
      }

      if(!password || !passwordConfirm){
        alert('For a new user, password and confirm password are required.');
        return;
      }
      if(password.length<6){
        alert('Password must contain at least 6 characters.');
        return;
      }
      if(password!==passwordConfirm){
        alert('Password and Confirm Password do not match.');
        return;
      }

      const credential=await createUserWithEmailAndPassword(userCreationAuth,email,password);
      const newUser=credential.user;
      try{ await updateProfile(newUser,{displayName:name}); }catch(profileError){ console.warn('Display name update skipped:',profileError); }

      await setDoc(doc(firestoreDb,'users',newUser.uid),{
        name,email,role,status,
        createdAt:new Date().toISOString(),
        createdBy:currentUser?.uid || ''
      });

      await signOut(userCreationAuth);
      resetUserForm();
      addUserForm.style.display='none';
      await loadUserManagement();
      alert('User created successfully.\n\nEmail: '+email+'\nRole: '+role+'\nStatus: '+status);

    }catch(error){
      console.error('User save error:',error);
      let message='Could not save user.';
      if(error.code==='auth/email-already-in-use') message='This email is already registered in Firebase Authentication.';
      else if(error.code==='auth/invalid-email') message='Please enter a valid email address.';
      else if(error.code==='auth/weak-password') message='Password must contain at least 6 characters.';
      else if(error.message) message=error.message;
      alert(message);
    }finally{
      if(saveButton){ saveButton.disabled=false; saveButton.textContent=editingId?'💾 Update User':'💾 Save User'; }
    }
  });
}
