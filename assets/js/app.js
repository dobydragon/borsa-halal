/* =====================================================================
   مركز البورصة الحلال — منطق الموقع (محلي بالكامل، بدون أي اتصال خارجي)
   التخزين: localStorage في المتصفح على جهازك فقط (مش مكان آمن لبيانات حساسة)
   ===================================================================== */
(function(){
'use strict';
var BH = window.BH || (window.BH = {});
var $ = function(s,r){return (r||document).querySelector(s)};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var PRINT = false;          // أثناء تجهيز الطباعة: كل الأقسام مفتوحة والروابط خارجية
var CITED = null;           // تجميع المراجع المستخدمة أثناء التصدير

/* ---------------- تخزين محلي آمن من الأعطال ---------------- */
var store = {
  get:function(k,d){try{var v=localStorage.getItem('bh.'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem('bh.'+k,JSON.stringify(v));return true}catch(e){toast('تعذّر الحفظ في المتصفح (قد يكون التخزين مقفولًا)');return false}},
  del:function(k){try{localStorage.removeItem('bh.'+k)}catch(e){}},
  keys:function(){var a=[];try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('bh.')===0)a.push(k)}}catch(e){}return a}
};

/* ---------------- أيقونات ---------------- */
var IC = {
  home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
  learn:'<path d="M2 7l10-4 10 4-10 4z"/><path d="M6 9v5c0 2 3 3 6 3s6-1 6-3V9"/>',
  shariah:'<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-3 7h6z"/><path d="M19 7l-3 7h6z"/>',
  sources:'<path d="M4 4h16v6H4z"/><path d="M4 14h16v6H4z"/><path d="M8 7h.01M8 17h.01"/>',
  msg:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  book:'<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7"/>',
  box:'<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01"/>',
  link:'<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  cases:'<path d="M3 7h18v13H3z"/><path d="M8 7V4h8v3"/>',
  compare:'<path d="M8 3v18M16 3v18"/><path d="M3 8h5M16 16h5"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  report:'<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6M9 9h2"/>',
  star:'<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
  warn:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  check:'<path d="M5 12l4 4 10-10"/>',
  calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
  scale:'<path d="M12 3v18M5 21h14"/><path d="M5 7h14"/><path d="M5 7l-3 7h6zM19 7l-3 7h6z"/>',
  bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  prev:'<path d="M9 6l6 6-6 6"/>',
  next:'<path d="M15 6l-6 6 6 6"/>',
  ext:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
  dl:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/>'
};
function ic(n,cls){return '<svg class="'+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[n]||IC.info)+'</svg>'}

/* ---------------- أدوات نصية ---------------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var refById = {};
(BH.refs||[]).forEach(function(r){refById[r.id]=r});
var termByKey = {};
(BH.glossary||[]).forEach(function(t){termByKey[t.key]=t});

/* القوالب داخل المحتوى:
   {{R12}} أو {{R12,R13}}  → رقم مرجع قابل للنقر
   [[key|نص]]               → مصطلح يظهر تعريفه عند الضغط */
function fmt(h){
  if(h==null) return '';
  h = String(h);
  h = h.replace(/\{\{([A-Z0-9,\s-]+)\}\}/g,function(_,ids){
    return ids.split(',').map(function(id){
      id=id.trim(); var r=refById[id];
      if(!r) return '<span class="ref" title="مرجع غير موجود في السجل">؟</span>';
      if(CITED) CITED[id]=1;
      var href = PRINT ? (r.url||'#') : '#/refs/'+id;
      return '<a class="ref" href="'+esc(href)+'" title="'+esc(r.title+' — '+(r.publisher||''))+'"'+(PRINT?'':' data-ref="'+id+'"')+'>'+id+'</a>';
    }).join('');
  });
  h = h.replace(/\[\[([a-z0-9_-]+)\|([^\]]+)\]\]/g,function(_,k,label){
    if(PRINT||!termByKey[k]) return label;
    return '<button type="button" class="term" data-term="'+k+'">'+label+'</button>';
  });
  return h;
}
function list(arr,ordered){if(!arr||!arr.length)return '';var t=ordered?'ol':'ul';return '<'+t+'>'+arr.map(function(x){return '<li>'+fmt(x)+'</li>'}).join('')+'</'+t+'>'}

/* حالات التحقق والحكم — ألوان محايدة، لا يوجد لون "حلال" أو "حرام" */
var STATUS = {
  verified:{t:'تم التحقق',c:'b-verified'},
  partial:{t:'تحقق جزئي',c:'b-prelim'},
  prelim:{t:'تقييم مبدئي',c:'b-prelim'},
  unproven:{t:'غير مثبت',c:'b-unproven'},
  disputed:{t:'محل خلاف معتبر',c:'b-disputed'},
  needinfo:{t:'يحتاج معلومات إضافية',c:'b-needinfo'},
  unreachable:{t:'تعذر التحقق',c:'b-unproven'},
  invalid:{t:'رابط غير صالح',c:'b-risk'},
  alternate:{t:'مصدر بديل',c:'b-prelim'},
  exists_claim_unproven:{t:'المصدر موجود والادعاء غير مثبت',c:'b-unproven'},
  noncompliant:{t:'غير متوافق بحسب الأدلة المتاحة',c:'b-risk'},
  compliant_prelim:{t:'متوافق مبدئيًا بشروط',c:'b-verified'},
  unsettled:{t:'غير محسوم',c:'b-needinfo'},
  documented:{t:'واقعة موثقة',c:'b-verified'},
  hypothetical:{t:'مثال افتراضي',c:'b-plain'},
  scenario:{t:'سيناريو محتمل',c:'b-plain'},
  claim:{t:'ادعاء لم يُتحقق منه',c:'b-unproven'},
  correct:{t:'صحيح',c:'b-verified'},
  misleading:{t:'مضلل',c:'b-risk'},
  wrong:{t:'خطأ',c:'b-risk'},
  conditional:{t:'يعتمد على الظروف',c:'b-prelim'},
  mixed:{t:'صحيح جزئيًا',c:'b-prelim'},
  inconsistent:{t:'غير متسق مع الأدلة',c:'b-risk'},
  not_verifiable:{t:'لم يمكن التحقق منه',c:'b-unproven'}
};
function badge(k,extra){var s=STATUS[k]||{t:k,c:'b-plain'};return '<span class="badge '+s.c+'">'+esc(s.t)+(extra?' · '+esc(extra):'')+'</span>'}
var RISK = {low:'منخفضة',mid:'متوسطة',high:'عالية',vhigh:'عالية جدًا'};
function riskBadge(r){if(!r)return '';return '<span class="badge '+(r==='low'?'b-plain':r==='mid'?'b-prelim':'b-risk')+'">مخاطرة '+RISK[r]+'</span>'}

function acc(title,body,opts){
  opts=opts||{};
  if(!body) return '';
  return '<details class="acc"'+((opts.open||PRINT)?' open':'')+(opts.id?' id="'+opts.id+'"':'')+'><summary>'+(opts.icon?'<span class="sico">'+ic(opts.icon)+'</span>':'')+esc(title)+'</summary><div class="acc-body">'+body+'</div></details>';
}
function callout(kind,title,body){
  var icn={info:'info',warn:'warn',risk:'alert',shariah:'scale'}[kind]||'info';
  return '<div class="callout '+kind+'">'+ic(icn)+'<div>'+(title?'<b class="t">'+esc(title)+'</b>':'')+fmt(body)+'</div></div>';
}
function table(heads,rows,cls){
  return '<div class="table-wrap"><table class="'+(cls||'')+'"><thead><tr>'+heads.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+
    rows.map(function(r){return '<tr'+(r._cls?' class="'+r._cls+'"':'')+'>'+(r.cells||r).map(function(c){return '<td>'+fmt(c)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>';
}
function crumbs(arr){
  return '<nav class="crumbs no-print" aria-label="مسار التنقل"><a href="#/">الرئيسية</a>'+arr.map(function(c){return '<span class="sep">‹</span>'+(c[1]?'<a href="'+c[1]+'">'+esc(c[0])+'</a>':'<span>'+esc(c[0])+'</span>')}).join('')+'</nav>';
}
function head(title,lead,cr){return (cr?crumbs(cr):'')+'<h1 class="page-title">'+esc(title)+'</h1>'+(lead?'<p class="lead">'+fmt(lead)+'</p>':'')}
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove('show')},2200)}

/* ---------------- التقدم والمفضلة والملاحظات ---------------- */
function progress(){return store.get('progress',{})}
function setProgress(id,v){var p=progress();if(v)p[id]={s:v,at:new Date().toISOString()};else delete p[id];store.set('progress',p)}
function favs(){return store.get('favs',{})}
function toggleFav(key,title){var f=favs();if(f[key])delete f[key];else f[key]={t:title,at:new Date().toISOString()};store.set('favs',f);return !!f[key]}
function notes(){return store.get('notes',{})}
function setNote(key,title,txt){var n=notes();if(txt&&txt.trim())n[key]={t:title,txt:txt,at:new Date().toISOString()};else delete n[key];store.set('notes',n)}
var PSTAT={studied:'درسته',understood:'فهمته',review:'محتاج مراجعة'};

function noteBox(key,title){
  if(PRINT){
    if(!$('#incNotes')||!$('#incNotes').checked) return '';
    var n0=notes()[key]; return n0?acc('ملاحظاتي الشخصية','<p style="white-space:pre-line">'+esc(n0.txt)+'</p>',{icon:'pen'}):'';
  }
  var n=notes()[key];
  return acc('ملاحظاتي الشخصية (محفوظة على جهازك فقط)',
    '<textarea class="note" data-note="'+esc(key)+'" data-title="'+esc(title)+'" placeholder="اكتب اللي فهمته أو أسئلتك هنا… الحفظ تلقائي داخل المتصفح على الجهاز ده.">'+esc(n?n.txt:'')+'</textarea><div class="note-meta">'+(n?'آخر حفظ: '+new Date(n.at).toLocaleString('ar-EG'):'لا توجد ملاحظة بعد')+' — لا تكتب هنا كلمات سر أو بيانات حساسة. <a href="#/privacy">أين تُحفظ؟</a></div>',
    {icon:'pen',open:!!n});
}
function favBtn(key,title){var on=!!favs()[key];return '<button class="iconbtn '+(on?'fav-on':'')+'" data-fav="'+esc(key)+'" data-title="'+esc(title)+'">'+ic('star')+'<span class="lbl">'+(on?'في المفضلة':'أضف للمفضلة')+'</span></button>'}
function exportBtn(chapterId){return '<button class="iconbtn" data-export="'+esc(chapterId)+'">'+ic('dl')+'<span class="lbl">PDF لهذه الصفحة</span></button>'}

/* ---------------- القائمة الجانبية ---------------- */
var NAV = [
  ['البداية',[
    ['#/','home','اللوحة الرئيسية'],
    ['#/privacy','lock','التشغيل والخصوصية']]],
  ['التعلّم',[
    ['#/learn','learn','التعلّم من الصفر','lessons'],
    ['#/glossary','book','قاموس المصطلحات','glossary'],
    ['#/quiz','quiz','اختبر فهمك'],
    ['#/progress','chart','تقدّم التعلّم']]],
  ['الشريعة والمنتجات',[
    ['#/shariah','shariah','المرجع الشرعي'],
    ['#/products','box','تقييم المنتجات المالية','products'],
    ['#/compare','compare','مقارنات: الاسم واحد والحكم مختلف'],
    ['#/cases','cases','حالات حقيقية موثقة','cases']]],
  ['فحص القناة',[
    ['#/sources','sources','فحص المصادر'],
    ['#/channel','report','تقرير موثوقية القناة'],
    ['#/messages','msg','تحليل الرسائل','messages'],
    ['#/recs','list','سجل التوصيات'],
    ['#/warnings','alert','علامات التحذير','warnings']]],
  ['المراجع',[
    ['#/refs','link','المصادر والمراجع','refs']]]
];
function renderNav(){
  var h='';
  NAV.forEach(function(g){
    h+='<div class="nav-group">'+g[0]+'</div>';
    g[1].forEach(function(i){
      var c=i[3]&&BH[i[3]]?'<span class="count">'+BH[i[3]].length+'</span>':'';
      h+='<a href="'+i[0]+'" data-r="'+i[0]+'">'+ic(i[1])+'<span>'+i[2]+'</span>'+c+'</a>';
    });
  });
  $('#nav').innerHTML=h;
}
function markNav(hash){
  var best=null;
  $$('#nav a').forEach(function(a){a.classList.remove('active');var r=a.getAttribute('data-r');if(hash===r||(r!=='#/'&&hash.indexOf(r)===0)){if(!best||r.length>best.getAttribute('data-r').length)best=a}});
  if(!best&&(hash==='#/'||hash===''))best=$('#nav a[data-r="#/"]');
  if(best)best.classList.add('active');
}

/* =====================================================================
   الصفحات
   ===================================================================== */
var V = {};

/* ---------- اللوحة الرئيسية ---------- */
V.home = function(){
  var S=BH.scan||{};
  var p=progress(), done=0, und=0;
  (BH.lessons||[]).forEach(function(l){if(p[l.id]){done++;if(p[l.id].s==='understood')und++}});
  var nl=(BH.lessons||[]).length, pct=nl?Math.round(done/nl*100):0;
  var vr=(BH.refs||[]).filter(function(r){return r.status==='verified'}).length;
  var h=head('أهلًا بيك في مركزك الشخصي','هنا هتتعلم الاستثمار والتداول من الصفر، بالأحكام الشرعية وأدلتها، وتشوف تحليل محايد لقناة «Borsa Halal» — من غير ما حد يقولك «اشتري» أو «بيع».');
  h+=callout('warn','قبل أي حاجة','الموقع ده <b>للتعليم والفهم</b>. مش فتوى، ومش توصية بشراء أو بيع أي حاجة. أي قرار فيه فلوس حقيقية محتاج مراجعة عالم متخصص في فقه المعاملات المالية، وتكون قادر تتحمل الخسارة.');
  h+='<div class="grid g4" style="margin-top:16px">'+
    stat(S.telegramPosts!=null?S.telegramPosts:'—','رسالة في القناة تم جمعها',S.telegramRange||'')+
    stat((BH.messages||[]).length,'رسالة/بوست تم تحليله بالتفصيل','')+
    stat(vr+' / '+(BH.refs||[]).length,'مرجع تم فتحه والتحقق منه','من إجمالي المراجع المسجلة')+
    stat(pct+'%','تقدّمك في الدروس',done+' من '+nl+' درس'+(und?' — فهمت '+und:''))+'</div>';
  h+='<div class="progress" style="margin:14px 0 4px"><i style="width:'+pct+'%"></i></div>';
  h+='<h2>حالة الفحص باختصار</h2><div class="grid g2">';
  (S.summary||[]).forEach(function(s){h+='<div class="card"><div class="kicker">'+badge(s.status)+'</div><h3>'+esc(s.title)+'</h3><p>'+fmt(s.text)+'</p>'+(s.link?'<a href="'+s.link+'">التفاصيل ‹</a>':'')+'</div>'});
  h+='</div>';
  h+='<h2>ابدأ من هنا</h2><div class="grid g3">'+
    qlink('#/learn','learn','التعلّم من الصفر','دروس بالترتيب: من «يعني إيه سهم» لحد الرافعة المالية والمشتقات.')+
    qlink('#/shariah','scale','المرجع الشرعي','الربا، الغرر، الميسر، القبض… بالأدلة وقرارات المجامع والخلاف المعتبر.')+
    qlink('#/messages','msg','تحليل رسائل القناة','كل رسالة: شرح بسيط، حسابات، تحقق، مخاطر، ودرس مستفاد.')+
    qlink('#/channel','report','تقرير موثوقية القناة','جدول: العنصر، الأدلة، مصدر التحقق، درجة الثقة، الاستنتاج.')+
    qlink('#/cases','cases','حالات حقيقية','FTX، مادوف، أركيجوس… إيه اللي حصل وإيه الدرس.')+
    qlink('#/glossary','book','قاموس المصطلحات','كل كلمة إنجليزي هتقابلها، بمثال بالأرقام.')+'</div>';
  if((S.todo||[]).length){
    h+='<h2>موضوعات لسه محتاجة استكمال</h2><div class="card flat">'+list(S.todo)+'</div>';
  }
  h+='<h2>طريقة العمل (المراحل)</h2>'+table(['المرحلة','إيه اللي بيحصل','الحالة'],(S.phases||[]).map(function(p){return [p[0],p[1],badge(p[2])]}));
  return h;
};
function stat(v,l,s){return '<div class="card stat"><b>'+esc(v)+'</b><span>'+esc(l)+'</span>'+(s?'<small>'+esc(s)+'</small>':'')+'</div>'}
function qlink(href,icon,t,d){return '<a class="card" href="'+href+'"><div class="kicker">'+ic(icon)+'</div><h3>'+esc(t)+'</h3><p style="color:var(--ink-2);font-size:.92rem;margin:0">'+esc(d)+'</p></a>'}

/* ---------- الدروس ---------- */
var LEVELS=['مبتدئ','متوسط','متقدم'];
V.learn = function(){
  var p=progress(), f=store.get('f.learn',{lv:'',dm:''});
  var domains=[];(BH.lessons||[]).forEach(function(l){if(domains.indexOf(l.domain)<0)domains.push(l.domain)});
  var h=head('التعلّم من الصفر','كل درس بيبدأ بملخص بسيط، وبعدين شرح بالتدريج، وأمثلة بالأرقام، وحالة حقيقية لو موجودة، والفحص الشرعي، وفي الآخر اختبار قصير. امشي بالترتيب لو إنت مبتدئ.',[['التعلّم']]);
  h+='<div class="toolbar"><span style="font-size:.85rem;color:var(--ink-3)">المستوى:</span><div class="chips" style="margin:0">'+['',].concat(LEVELS).map(function(l){return '<button class="chip'+(f.lv===l?' on':'')+'" data-flt="lv" data-v="'+l+'">'+(l||'الكل')+'</button>'}).join('')+'</div>'+
     '<select data-flt="dm" aria-label="المجال"><option value="">كل المجالات</option>'+domains.map(function(d){return '<option'+(f.dm===d?' selected':'')+'>'+esc(d)+'</option>'}).join('')+'</select></div>';
  LEVELS.forEach(function(lv){
    var ls=(BH.lessons||[]).filter(function(l){return l.level===lv&&(!f.lv||f.lv===lv)&&(!f.dm||f.dm===l.domain)});
    if(!ls.length)return;
    h+='<h2>'+lv+'</h2><div class="grid g2">';
    ls.forEach(function(l){
      var st=p[l.id];
      h+='<a class="card" href="#/learn/'+l.id+'"><div class="kicker"><span class="level">'+l.n+'</span>'+esc(l.domain)+(st?' · <span class="badge b-brand">'+PSTAT[st.s]+'</span>':'')+'</div><h3>'+esc(l.title)+'</h3><p style="color:var(--ink-2);font-size:.92rem;margin:0">'+esc(l.short)+'</p></a>';
    });
    h+='</div>';
  });
  return h;
};
V.lesson = function(id){
  var ls=BH.lessons||[], i=-1;
  ls.forEach(function(l,k){if(l.id===id)i=k});
  if(i<0) return notFound();
  var l=ls[i], st=progress()[l.id], key='learn/'+l.id;
  var h=head(l.title,'',[['التعلّم','#/learn'],[l.title]]);
  h+='<div class="msg-meta"><span class="level">درس '+l.n+'</span><span>'+esc(l.level)+'</span><span>·</span><span>'+esc(l.domain)+'</span>'+(l.updated?'<span>· آخر مراجعة '+esc(l.updated)+'</span>':'')+'</div>';
  if(!PRINT){
    h+='<div class="lesson-actions">'+['studied','understood','review'].map(function(s){return '<button class="chip'+(st&&st.s===s?' on':'')+'" data-prog="'+l.id+'" data-v="'+s+'">'+PSTAT[s]+'</button>'}).join('')+favBtn(key,l.title)+exportBtn('lesson:'+l.id)+'</div>';
  }
  h+='<div class="card" style="border-inline-start:4px solid var(--brand)"><div class="kicker">'+ic('bulb')+'الملخص في سطور</div>'+fmt(l.summary)+'</div>';
  h+=acc('الشرح خطوة بخطوة',fmt(l.body),{open:true,icon:'learn'});
  (l.examples||[]).forEach(function(ex){h+=acc(ex.title,(ex.kind?'<p>'+badge(ex.kind)+'</p>':'')+fmt(ex.html),{icon:'calc',open:!!ex.open})});
  if(l.cases&&l.cases.length){
    h+=acc('حالة حقيقية مرتبطة',l.cases.map(function(cid){var c=caseById(cid);return c?'<p>'+badge('documented')+' <a href="#/cases/'+c.id+'"><b>'+esc(c.title)+'</b></a> — '+esc(c.when)+'</p><p>'+fmt(c.lesson_link||c.what)+'</p>':''}).join(''),{icon:'cases'});
  }
  h+=acc('الفحص الشرعي',fmt(l.shariah),{icon:'scale'});
  h+=acc('الخلاف المعتبر',fmt(l.dispute),{icon:'shariah'});
  h+=acc('المخاطر والأخطاء الشائعة',fmt(l.risks),{icon:'alert'});
  if(l.checklist) h+=acc('قائمة تحقق قبل أي قرار',checklist(key,l.checklist),{icon:'check'});
  if(l.todo) h+=acc('ماذا أفعل بهذه المعلومة؟',list(l.todo,true),{icon:'bulb',open:true});
  if(l.known||l.unknown) h+='<h2>ما نعرفه وما لا نعرفه</h2><div class="know"><div class="card flat"><h3>'+ic('check')+' ما نعرفه</h3>'+list(l.known)+'</div><div class="card flat"><h3>'+ic('info')+' ما لا نعرفه / يحتاج تحقق</h3>'+list(l.unknown)+'</div></div>';
  if(l.quiz&&l.quiz.length) h+='<h2>اختبار قصير</h2>'+quiz(l.quiz,'q.'+l.id);
  h+=noteBox(key,l.title);
  if(!PRINT){
    h+='<div class="lesson-nav">'+(i>0?'<a class="iconbtn" href="#/learn/'+ls[i-1].id+'">'+ic('prev')+'الدرس السابق: '+esc(ls[i-1].title)+'</a>':'<span></span>')+
       (i<ls.length-1?'<a class="iconbtn primary" href="#/learn/'+ls[i+1].id+'">الدرس التالي: '+esc(ls[i+1].title)+ic('next')+'</a>':'')+'</div>';
  }
  return h;
};
function checklist(key,items){
  var saved=store.get('chk.'+key,{});
  return '<div class="checklist">'+items.map(function(it,k){
    if(typeof it==='object'&&it.group) return '<div class="grp">'+esc(it.group)+'</div>';
    return '<label><input type="checkbox" data-chk="'+esc(key)+'" data-i="'+k+'"'+(saved[k]?' checked':'')+(PRINT?' disabled':'')+'><span>'+fmt(it)+'</span></label>';
  }).join('')+'</div><p style="font-size:.85rem;color:var(--ink-3);margin-top:8px">لو فيه أي سؤال إجابته «مش عارف» — النتيجة الصحيحة هي: <b>يحتاج مزيد من التحقق</b>، مش «أدخل».</p>';
}
function quiz(qs,key){
  var ans=store.get(key,{});
  return '<div class="quiz">'+qs.map(function(q,k){
    var a=ans[k];
    return '<div class="q'+(a!=null?' done':'')+'" data-quiz="'+key+'" data-k="'+k+'"><b>'+(k+1)+'. '+fmt(q.q)+'</b>'+
      q.opts.map(function(o,j){var cls=a!=null?(j===q.a?' right':(j===a?' wrong':'')):'';return '<button type="button" class="opt'+cls+'" data-j="'+j+'">'+fmt(o)+'</button>'}).join('')+
      '<div class="pr-answer"><b>الإجابة الصحيحة:</b> '+fmt(q.opts[q.a])+'</div>'+
      '<div class="why">'+(a!=null?(a===q.a?'<b>صح ✓</b> ':'<b>مش دي.</b> الإجابة الصحيحة: «'+fmt(q.opts[q.a])+'». '):'')+fmt(q.why)+'</div></div>';
  }).join('')+'</div>';
}

/* ---------- المرجع الشرعي ---------- */
V.shariah = function(){
  var S=BH.shariah||{};
  var h=head('المرجع الشرعي',S.lead||'',[['المرجع الشرعي']]);
  h+=callout('shariah','تنبيه مهم',S.note||'');
  if(S.method) h+=acc('منهج اختيار المصادر والفتاوى',fmt(S.method),{icon:'scale'});
  h+='<h2>القواعد الأساسية في المعاملات المالية</h2><div class="grid g2">';
  (S.principles||[]).forEach(function(p){h+='<div class="card"><div class="kicker">'+ic('scale')+esc(p.en||'')+'</div><h3>'+esc(p.title)+'</h3>'+fmt(p.html)+'</div>'});
  h+='</div>';
  if(S.topics&&S.topics.length){
    h+='<h2>الأحكام حسب الموضوع</h2>';
    S.topics.forEach(function(t){
      h+=acc(t.title,'<p>'+badge(t.status)+'</p>'+
        (t.quoted?'<h3>الحكم المنقول</h3>'+fmt(t.quoted):'')+
        (t.agree?'<h3>محل الاتفاق</h3>'+fmt(t.agree):'')+
        (t.dispute?'<h3>محل الخلاف</h3>'+fmt(t.dispute):'')+
        (t.open?'<h3>ما لم يُحسم</h3>'+fmt(t.open):''),{icon:'shariah',id:'t-'+t.id});
    });
  }
  return h;
};

/* ---------- فحص المصادر ---------- */
V.sources = function(){
  var S=BH.sources||{};
  var h=head('فحص المصادر','فهرس بكل حاجة اتبعتت للفحص: إيه هي، وصلنا لها ولا لأ، واتفحصت لحد فين.',[['فحص المصادر']]);
  h+=exportInline('sources');
  h+=table(['#','المصدر','النوع','حالة الوصول','مدى الفحص','ملاحظات'],(S.items||[]).map(function(s){return [s.id,s.url?'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+'</a>':esc(s.title),s.type,badge(s.access),s.coverage,s.notes||'']}));
  if(S.cannot) h+=callout('warn','اللي ماقدرناش نوصله أو نفحصه',list(S.cannot));
  if(S.need) h+=callout('info','محتاج منك (اختياري) عشان الفحص يكمل',list(S.need));
  return h;
};
V.channel = function(){
  var R=BH.channelReport||{};
  var h=head('تقرير موثوقية القناة',R.lead||'',[['فحص القناة'],['تقرير الموثوقية']]);
  h+=exportInline('channel');
  h+=callout('info','قاعدة التقييم','عدد المشتركين، وكثرة التفاعل، وصور الأرباح <b>مش دليل كافي</b> على الموثوقية. والحكم هنا على <b>المحتوى والأدلة</b>، مش على نية الشخص.');
  h+=table(['العنصر','الأدلة','مصدر التحقق','درجة الثقة','الاستنتاج'],(R.rows||[]).map(function(r){return [r[0],r[1],r[2],r[3],r[4]]}));
  if(R.verdict) h+='<h2>الخلاصة</h2><div class="card">'+fmt(R.verdict)+'</div>';
  if(R.whatToDo) h+=acc('ماذا أفعل بهذه المعلومة؟',list(R.whatToDo,true),{open:true,icon:'bulb'});
  return h;
};

/* ---------- تحليل الرسائل ---------- */
var MCATS=['تعليمي/شرعي','إخباري','تسويقي/خدمة مدفوعة','توصية تداول','تحليل شركة','أخرى'];
V.messages = function(){
  var f=store.get('f.msg',{c:'',s:'',q:''});
  var ms=(BH.messages||[]).filter(function(m){return (!f.c||m.cat===f.c)&&(!f.s||m.verdict===f.s)&&(!f.q||(m.title+' '+m.quickSummary+' '+(m.original||'')).indexOf(f.q)>=0)});
  var h=head('تحليل الرسائل','كل رسالة متحللة بنفس الهيكل: الأصل، الشرح البسيط، المصطلحات، المقصود، الادعاءات، التحقق، الحسابات، المخاطر، علامات التحذير، التقييم، والدرس.',[['فحص القناة'],['تحليل الرسائل']]);
  if(BH.msgIntro) h+=callout('info','',BH.msgIntro);
  var verdicts=[];(BH.messages||[]).forEach(function(m){if(verdicts.indexOf(m.verdict)<0)verdicts.push(m.verdict)});
  h+='<div class="toolbar"><input type="search" data-flt-msg="q" value="'+esc(f.q)+'" placeholder="ابحث في الرسائل…"><select data-flt-msg="c"><option value="">كل التصنيفات</option>'+MCATS.map(function(c){return '<option'+(f.c===c?' selected':'')+'>'+c+'</option>'}).join('')+'</select><select data-flt-msg="s"><option value="">كل التقييمات</option>'+verdicts.map(function(v){return '<option value="'+v+'"'+(f.s===v?' selected':'')+'>'+(STATUS[v]?STATUS[v].t:v)+'</option>'}).join('')+'</select></div>';
  if(!ms.length) h+='<div class="empty">مفيش رسائل مطابقة للفلتر.</div>';
  h+='<div class="grid g2">'+ms.map(function(m){
    return '<a class="card" href="#/messages/'+m.id+'"><div class="kicker">'+badge(m.verdict)+'<span class="badge b-plain">'+esc(m.cat)+'</span>'+riskBadge(m.risk)+'</div><h3>'+esc(m.title)+'</h3><div class="msg-meta">'+esc(m.date||'بدون تاريخ ظاهر')+' · '+esc(m.where||'')+'</div><p style="color:var(--ink-2);font-size:.92rem;margin:0">'+esc(m.quickSummary)+'</p></a>';
  }).join('')+'</div>';
  return h;
};
V.message = function(id){
  var m=(BH.messages||[]).filter(function(x){return x.id===id})[0];
  if(!m) return notFound();
  var key='messages/'+m.id;
  var h=head(m.title,'',[['تحليل الرسائل','#/messages'],[m.title]]);
  h+='<div class="msg-meta">'+badge(m.verdict)+'<span class="badge b-plain">'+esc(m.cat)+'</span>'+riskBadge(m.risk)+'<span>'+esc(m.date||'بدون تاريخ ظاهر')+'</span><span>·</span><span>'+(m.link?'<a href="'+esc(m.link)+'" target="_blank" rel="noopener noreferrer">'+esc(m.where)+'</a>':esc(m.where||''))+'</span></div>';
  if(!PRINT) h+='<div class="lesson-actions">'+favBtn(key,m.title)+exportBtn('msg:'+m.id)+'</div>';
  h+='<div class="card" style="border-inline-start:4px solid var(--accent)"><div class="kicker">'+ic('bulb')+'الملخص السريع</div><p style="margin:0">'+fmt(m.quickSummary)+'</p></div>';
  h+=acc('1. الرسالة الأصلية (مقتطف)','<div class="quote">'+esc(m.original)+'</div>'+(m.originalNote?'<p style="font-size:.85rem;color:var(--ink-3)">'+fmt(m.originalNote)+'</p>':''),{icon:'msg',open:true});
  h+=acc('2. الشرح البسيط للمبتدئ',fmt(m.simple),{icon:'bulb',open:true});
  h+=acc('3. المصطلحات',fmt(m.terms),{icon:'book'});
  h+=acc('4. المقصود عمليًا',fmt(m.intent),{icon:'info'});
  h+=acc('5. الادعاءات: حقائق قابلة للتحقق vs آراء ووعود',m.claims?table(['الادعاء','نوعه','نتيجة التحقق'],m.claims.map(function(c){return [c[0],c[1],badge(c[2])+(c[3]?'<div>'+fmt(c[3])+'</div>':'')]})):'',{icon:'list'});
  h+=acc('6. التحقق: الأدلة المستقلة',fmt(m.verify),{icon:'link'});
  h+=acc('7. الحسابات',fmt(m.calc),{icon:'calc'});
  h+=acc('التقييم الشرعي والأدلة',fmt(m.shariah),{icon:'scale'});
  h+=acc('8. المخاطر والمعلومات الناقصة',fmt(m.risks),{icon:'alert'});
  h+=acc('9. علامات التحذير',fmt(m.flags),{icon:'warn'});
  h+=acc('10. التقييم النهائي','<p>'+badge(m.verdict)+'</p>'+fmt(m.final),{icon:'check',open:true});
  h+=acc('11. ما الذي يجب أن أتعلمه؟',fmt(m.lesson),{icon:'learn',open:true});
  h+=noteBox(key,m.title);
  return h;
};

/* ---------- القاموس ---------- */
V.glossary = function(){
  var f=store.get('f.gl',{q:'',d:''});
  var doms=[];(BH.glossary||[]).forEach(function(t){if(doms.indexOf(t.domain)<0)doms.push(t.domain)});
  var h=head('قاموس المصطلحات','كل مصطلح: اسمه بالإنجليزي، معناه بالعربي البسيط، مثال بالأرقام، بيستخدم إزاي، والأخطاء الشائعة. ابحث بالعربي أو بالإنجليزي.',[['قاموس المصطلحات']]);
  h+=exportInline('glossary');
  h+='<div class="toolbar"><input type="search" id="glq" value="'+esc(f.q)+'" placeholder="مثال: Leverage أو الرافعة أو هامش…"><select id="gld"><option value="">كل المجالات</option>'+doms.map(function(d){return '<option'+(f.d===d?' selected':'')+'>'+esc(d)+'</option>'}).join('')+'</select></div><div id="glbox">'+glossaryList(f)+'</div>';
  return h;
};
function glossaryList(f){
  var q=(f.q||'').toLowerCase().trim();
  var ts=(BH.glossary||[]).filter(function(t){return (!f.d||t.domain===f.d)&&(!q||(t.en+' '+t.ar+' '+t.def).toLowerCase().indexOf(q)>=0)});
  if(!ts.length) return '<div class="empty">مفيش مصطلح مطابق. جرّب كلمة تانية.</div>';
  return ts.map(function(t){
    return acc(t.ar+'  —  '+t.en,'<p><span class="badge b-plain">'+esc(t.domain)+'</span></p><p><b>المعنى:</b> '+fmt(t.def)+'</p>'+(t.ex?'<p><b>مثال بالأرقام:</b> '+fmt(t.ex)+'</p>':'')+(t.use?'<p><b>بيستخدم إزاي:</b> '+fmt(t.use)+'</p>':'')+(t.err?'<p><b>أخطاء ومخاطر شائعة:</b> '+fmt(t.err)+'</p>':'')+(t.sh?callout('shariah','ملاحظة شرعية',t.sh):''),{id:'term-'+t.key});
  }).join('');
}

/* ---------- المنتجات ---------- */
V.products = function(){
  var f=store.get('f.pr',{s:'',r:''});
  var ps=(BH.products||[]).filter(function(p){return (!f.s||p.status===f.s)&&(!f.r||p.risk===f.r)});
  var sts=[];(BH.products||[]).forEach(function(p){if(sts.indexOf(p.status)<0)sts.push(p.status)});
  var h=head('تقييم المنتجات المالية','لكل منتج: طبيعته، بيكسب إزاي، بيتداول إزاي، الحكم الشرعي المبدئي وأسبابه وأدلته، الخلاف، المعلومات الناقصة، والنتيجة العملية.',[['تقييم المنتجات']]);
  h+=callout('shariah','اقرأ ده الأول','الحكم هنا <b>مبدئي وعام على نوع المنتج</b>، مش على منتج بعينه عند شركة بعينها. المنتج نفسه ممكن يتغير حكمه حسب العقد وطريقة التمويل والتنفيذ. والمنتج «المتوافق مبدئيًا» ممكن يخسرك فلوس عادي — <b>التوافق الشرعي ≠ قلة المخاطرة</b>.');
  h+=exportInline('products');
  h+='<div class="toolbar"><select data-flt-pr="s"><option value="">كل الأحكام المبدئية</option>'+sts.map(function(s){return '<option value="'+s+'"'+(f.s===s?' selected':'')+'>'+(STATUS[s]?STATUS[s].t:s)+'</option>'}).join('')+'</select><select data-flt-pr="r"><option value="">كل مستويات المخاطرة</option>'+Object.keys(RISK).map(function(r){return '<option value="'+r+'"'+(f.r===r?' selected':'')+'>مخاطرة '+RISK[r]+'</option>'}).join('')+'</select></div>';
  h+=table(['المنتج','بيكسب إزاي','الحكم المبدئي','المخاطرة'],ps.map(function(p){return ['<a href="#'+'/products/'+p.id+'"><b>'+esc(p.name)+'</b></a><div style="font-size:.8rem;color:var(--ink-3)" class="en">'+esc(p.en||'')+'</div>',p.how,badge(p.status),riskBadge(p.risk)]}));
  h+=ps.map(function(p){return productDetail(p)}).join('');
  return h;
};
function productDetail(p){
  return acc(p.name+(p.en?' ('+p.en+')':''),
    '<p>'+badge(p.status)+' '+riskBadge(p.risk)+'</p>'+
    table(['البند','التفاصيل'],[
      ['طبيعته وكيف يحقق الربح',p.nature],['طريقة التداول أو الاستثمار',p.trade],['الحكم الشرعي المبدئي',badge(p.status)+'<div>'+fmt(p.ruling)+'</div>'],
      ['الأسباب الشرعية',p.reasons],['الأدلة والمراجع',p.evidence],['المسائل المختلف فيها',p.dispute||'—'],
      ['المعلومات الناقصة',p.missing],['النتيجة العملية',p.practical]]),{id:'p-'+p.id,icon:'box'});
}
V.product = function(id){var p=(BH.products||[]).filter(function(x){return x.id===id})[0];if(!p)return notFound();return head(p.name,'',[['تقييم المنتجات','#/products'],[p.name]])+productDetail(p).replace('<details class="acc"','<details class="acc" open')+noteBox('products/'+p.id,p.name)};

/* ---------- المقارنات ---------- */
V.compare = function(){
  var h=head('مقارنات: الاسم شبه بعض والحكم مختلف','حاجتين شكلهم واحد، لكن العقد مختلف — فالنتيجة المالية والحكم الشرعي ممكن يختلفوا تمامًا.',[['مقارنات']]);
  h+=exportInline('compare');
  (BH.compares||[]).forEach(function(c){
    h+='<h2>'+esc(c.title)+'</h2>'+table(['البند',esc(c.a),esc(c.b)],c.rows)+(c.note?callout('info','',c.note):'');
  });
  return h;
};

/* ---------- الحالات الحقيقية ---------- */
function caseById(id){return (BH.cases||[]).filter(function(c){return c.id===id})[0]}
V.cases = function(){
  var h=head('حالات حقيقية موثقة','وقائع حصلت فعلًا ولها مصادر رسمية أو صحفية موثوقة. كل رقم هنا جاي من مصدر متاح للضغط عليه. اللي معرفناش نوثقه اتشال.',[['حالات حقيقية']]);
  h+=exportInline('cases');
  if(!(BH.cases||[]).length) h+='<div class="empty">جاري توثيق الحالات…</div>';
  h+='<div class="grid g2">'+(BH.cases||[]).map(function(c){return '<a class="card" href="#/cases/'+c.id+'"><div class="kicker">'+badge('documented')+'<span class="badge b-plain">'+esc(c.cat)+'</span></div><h3>'+esc(c.title)+'</h3><div class="msg-meta">'+esc(c.when)+' · '+esc(c.where)+'</div><p style="color:var(--ink-2);font-size:.92rem;margin:0">'+esc(c.short)+'</p></a>'}).join('')+'</div>';
  return h;
};
V.case_ = function(id){
  var c=caseById(id); if(!c) return notFound();
  return head(c.title,'',[['حالات حقيقية','#/cases'],[c.title]])+caseBody(c)+noteBox('cases/'+c.id,c.title);
};
function caseBody(c){
  var h='<div class="msg-meta">'+badge('documented')+'<span class="badge b-plain">'+esc(c.cat)+'</span><span>'+esc(c.when)+'</span><span>·</span><span>'+esc(c.where)+'</span>'+(c.confidence?'<span>· درجة الثقة: '+esc(c.confidence)+'</span>':'')+'</div>';
  if(!PRINT) h+='<div class="lesson-actions">'+favBtn('cases/'+c.id,c.title)+exportBtn('case:'+c.id)+'</div>';
  h+=acc('1. ماذا حدث بالتحديد؟',fmt(c.what),{open:true,icon:'info'});
  h+=acc('2. متى وأين؟','<p>'+esc(c.when)+' — '+esc(c.where)+'</p>',{icon:'info'});
  h+=acc('3. كيف كانت تعمل؟',fmt(c.how),{icon:'box',open:true});
  h+=acc('4. أثرها على المستثمرين (الثابت فقط)',fmt(c.impact),{icon:'chart'});
  h+=acc('5. الأسباب',fmt(c.causes),{icon:'alert'});
  h+=acc('6. الدروس المالية',list(c.lessons),{icon:'learn',open:true});
  h+=acc('7. المسألة الشرعية المرتبطة',fmt(c.shariah),{icon:'scale'});
  h+=acc('8. فتوى أو دراسة تناولت المعاملة نفسها',fmt(c.fatwa||'لم نجد فتوى أو دراسة شرعية منشورة عن هذه الواقعة بعينها. الكلام الشرعي فوق هو تطبيق لقواعد عامة، مش حكم صادر عن جهة على الواقعة نفسها.'),{icon:'book'});
  h+=acc('9. المصادر',list((c.refs||[]).map(function(r){return '{{'+r+'}} '+esc((refById[r]||{}).title||'')})),{icon:'link',open:true});
  return h;
}

/* ---------- التوصيات والتحذيرات ---------- */
V.recs = function(){
  var R=BH.recs||{};
  var h=head('سجل التوصيات','أي رسالة فيها «اشتري/بيع/دخول/هدف/وقف خسارة» أو اسم شركة مقترح. بنسجلها بتاريخها، ونتحقق منها لو فيه بيانات — ومن غير ما نخترع أسعار أو نتايج.',[['فحص القناة'],['سجل التوصيات']]);
  h+=callout('info','',R.intro||'');
  if((R.rows||[]).length) h+=table(['التاريخ','الرسالة','الأصل/الشركة','ما قيل بالنص','نوعه','نتيجة التحقق'],R.rows.map(function(r){return [r.date,r.link?'<a href="'+esc(r.link)+'" target="_blank" rel="noopener noreferrer">'+esc(r.msg)+'</a>':esc(r.msg),r.asset,r.said,r.kind,badge(r.status)+(r.note?'<div>'+fmt(r.note)+'</div>':'')]}));
  else h+='<div class="empty">'+fmt(R.empty||'لا توجد توصيات مسجلة.')+'</div>';
  if(R.howTo) h+=acc('إزاي أفحص أي توصية بنفسي؟',fmt(R.howTo),{icon:'check',open:true});
  return h;
};
var WTYPES={citation:'دقة الاستشهاد',claim:'ادعاء غير مثبت',contradiction:'تناقض/تعميم',risk:'خطر محتمل',marketing:'أسلوب تسويقي',regulatory:'وضع تنظيمي',access:'قيود الفحص'};
V.warnings = function(){
  var f=store.get('f.w',{t:''});
  var ws=(BH.warnings||[]).filter(function(w){return !f.t||w.type===f.t});
  var h=head('علامات التحذير','الادعاءات اللي محتاجة تحقق، الأخطاء في الاستشهاد، التعميمات، والمخاطر. <b>التحذير مش اتهام</b>: بنفرّق بين الخطأ العادي، والمبالغة التسويقية، والمعلومة غير المثبتة، والاشتباه المدعوم بأدلة.',[['فحص القناة'],['علامات التحذير']]);
  h+=exportInline('warnings');
  h+='<div class="chips">'+['',].concat(Object.keys(WTYPES)).map(function(t){return '<button class="chip'+(f.t===t?' on':'')+'" data-flt-w="'+t+'">'+(t?WTYPES[t]:'الكل')+'</button>'}).join('')+'</div>';
  h+=ws.map(function(w){return '<div class="card" style="margin-bottom:12px"><div class="kicker"><span class="badge b-plain">'+WTYPES[w.type]+'</span>'+badge(w.status)+(w.sev?'<span class="badge '+(w.sev==='high'?'b-risk':'b-prelim')+'">أهمية '+(w.sev==='high'?'عالية':w.sev==='mid'?'متوسطة':'منخفضة')+'</span>':'')+'</div><h3>'+esc(w.title)+'</h3>'+fmt(w.html)+(w.msg?'<p style="font-size:.85rem"><a href="#/messages/'+w.msg+'">الرسالة المرتبطة ‹</a></p>':'')+'</div>'}).join('');
  return h;
};

/* ---------- الاختبارات ---------- */
V.quiz = function(){
  var h=head('اختبر فهمك','أسئلة كل الدروس في مكان واحد. اختار الإجابة وهيظهرلك الشرح فورًا. إجاباتك بتتحفظ على جهازك.',[['اختبر فهمك']]);
  var tot=0,ok=0;
  (BH.lessons||[]).forEach(function(l){var a=store.get('q.'+l.id,{});(l.quiz||[]).forEach(function(q,k){tot++;if(a[k]===q.a)ok++})});
  h+='<div class="grid g3">'+stat(ok+' / '+tot,'إجابات صحيحة','')+'</div>';
  if(!PRINT) h+='<div class="toolbar"><button class="iconbtn" id="resetQuiz">مسح كل إجاباتي والبدء من جديد</button></div>';
  (BH.lessons||[]).forEach(function(l){if(l.quiz&&l.quiz.length)h+=acc('درس '+l.n+': '+l.title,quiz(l.quiz,'q.'+l.id),{icon:'quiz'})});
  return h;
};

/* ---------- المراجع ---------- */
V.refs = function(focus){
  var f=store.get('f.refs',{s:'',t:''});
  var types=[];(BH.refs||[]).forEach(function(r){if(types.indexOf(r.type)<0)types.push(r.type)});
  var rs=(BH.refs||[]).filter(function(r){return (!f.s||r.status===f.s)&&(!f.t||r.type===f.t)});
  var h=head('المصادر والمراجع','سجل مركزي: كل مرجع له رقم، ونوع، وتاريخ نشر لو موجود، وتاريخ التحقق من الرابط، ونتيجة التحقق وحدودها. الأرقام اللي جوه النصوص (زي <span class="ref" style="vertical-align:baseline">R01</span>) بتوديك هنا.',[['المراجع']]);
  h+=callout('info','معنى حالات التحقق','<b>تم التحقق</b> = الصفحة اتفتحت فعلًا ومحتواها بيدعم المعلومة. <b>تحقق جزئي</b> = الصفحة موجودة بس مااتفحصتش كلها. <b>تعذر التحقق</b> = ماقدرناش نوصلها. <b>مصدر بديل</b> = نسخة أرشيف أو نقل عن الأصل. الروابط بتفتح على الإنترنت، لكن باقي الموقع شغال من غير نت.');
  h+=exportInline('refs');
  h+='<div class="toolbar"><select data-flt-refs="s"><option value="">كل الحالات</option>'+['verified','partial','exists_claim_unproven','unreachable','invalid','alternate'].map(function(s){return '<option value="'+s+'"'+(f.s===s?' selected':'')+'>'+STATUS[s].t+'</option>'}).join('')+'</select><select data-flt-refs="t"><option value="">كل الأنواع</option>'+types.map(function(t){return '<option'+(f.t===t?' selected':'')+'>'+esc(t)+'</option>'}).join('')+'</select></div>';
  h+=refsTable(rs);
  return h;
};
function refsTable(rs){
  return '<div class="table-wrap"><table><thead><tr><th>رقم</th><th>المصدر</th><th>النوع</th><th>يدعم إيه</th><th>التحقق</th></tr></thead><tbody>'+rs.map(function(r){
    return '<tr id="ref-'+r.id+'"'+(PRINT?' ':'')+'><td><b class="en">'+r.id+'</b></td><td><a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer"><b>'+esc(r.title)+'</b></a><div style="font-size:.8rem;color:var(--ink-3)">'+esc(r.publisher||'')+(r.date?' · نُشر: '+esc(r.date):'')+'</div><div class="en" style="font-size:.72rem;color:var(--ink-3);word-break:break-all">'+esc(r.url)+'</div>'+(r.alt?'<div style="font-size:.8rem">رابط بديل: <a href="'+esc(r.alt)+'" target="_blank" rel="noopener noreferrer" class="en">'+esc(r.alt)+'</a></div>':'')+'</td><td>'+esc(r.type)+'</td><td>'+fmt(r.supports)+(r.quote?'<div class="quote" style="font-size:.85rem;margin:6px 0 0">'+esc(r.quote)+'</div>':'')+'</td><td>'+badge(r.status)+'<div style="font-size:.78rem;color:var(--ink-3)">تحقق: '+esc(r.checked||'—')+'</div>'+(r.limits?'<div style="font-size:.8rem">'+fmt(r.limits)+'</div>':'')+'</td></tr>';
  }).join('')+'</tbody></table></div>';
}

/* ---------- التقدم ---------- */
V.progress = function(){
  var p=progress(), f=favs(), n=notes();
  var h=head('تقدّم التعلّم','اللي درسته، اللي فهمته، واللي محتاج مراجعة — ومفضلتك وملاحظاتك. كل ده محفوظ في المتصفح على الجهاز ده بس.',[['تقدّم التعلّم']]);
  var rows=(BH.lessons||[]).map(function(l){var s=p[l.id];return ['<a href="#/learn/'+l.id+'">'+l.n+'. '+esc(l.title)+'</a>',esc(l.level),s?'<span class="badge b-brand">'+PSTAT[s.s]+'</span>':'<span class="badge b-needinfo">لسه</span>',s?new Date(s.at).toLocaleDateString('ar-EG'):'—']});
  h+='<h2>الدروس</h2>'+table(['الدرس','المستوى','الحالة','التاريخ'],rows);
  var fk=Object.keys(f);
  h+='<h2>المفضلة</h2>'+(fk.length?'<div class="card flat"><ul>'+fk.map(function(k){return '<li><a href="#/'+esc(k)+'">'+esc(f[k].t)+'</a></li>'}).join('')+'</ul></div>':'<div class="empty">مفيش حاجة في المفضلة. دوس ⭐ في أي درس أو رسالة.</div>');
  var nk=Object.keys(n);
  h+='<h2>ملاحظاتي</h2>'+(nk.length?nk.map(function(k){return '<div class="card flat" style="margin-bottom:10px"><div class="kicker">'+new Date(n[k].at).toLocaleString('ar-EG')+'</div><h3><a href="#/'+esc(k)+'">'+esc(n[k].t)+'</a></h3><p style="white-space:pre-line;margin:0">'+esc(n[k].txt)+'</p></div>'}).join(''):'<div class="empty">مفيش ملاحظات لسه.</div>');
  h+='<h2>بياناتك المحلية</h2><div class="toolbar"><button class="iconbtn" id="dataExport">'+ic('dl')+'تنزيل نسخة من ملاحظاتي وتقدّمي (ملف JSON)</button><label class="iconbtn" style="cursor:pointer">استيراد نسخة<input type="file" id="dataImport" accept="application/json" hidden></label><button class="iconbtn" id="dataClear" style="color:var(--risk)">مسح كل بياناتي من المتصفح</button></div>';
  h+=callout('warn','مهم','التخزين ده (localStorage) <b>مش مكان آمن</b>: أي حد يفتح نفس المتصفح على نفس الجهاز يقدر يشوفه. ماتكتبش فيه كلمات سر أو أرقام حسابات أو مبالغ حقيقية. التفاصيل في <a href="#/privacy">صفحة الخصوصية</a>.');
  return h;
};

/* ---------- الخصوصية ---------- */
V.privacy = function(){return head('التشغيل والخصوصية','',[['التشغيل والخصوصية']])+fmt((BH.privacy||{}).html||'')};

function notFound(){return head('الصفحة مش موجودة','ارجع <a href="#/">للرئيسية</a>.')}
function exportInline(ch){return PRINT?'':'<div class="lesson-actions">'+exportBtn(ch)+'</div>'}


/* الأرقام بإشارات (−5% ، +1,000 ، 1:10) تتعزل كـ LTR عشان ماتتقلبش جوه النص العربي */
var NUMRE=/\(?[−+\-]?\d[\d,.]*(?:\s?%)?\$?\)?(?:(?:\s*[−+\-×÷=\/]\s*|:)\(?[−+\-]?\d[\d,.]*(?:\s?%)?\$?\)?)*/g;
function ltrNums(root){
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
    var p=n.parentNode; if(!p||!/\d/.test(n.nodeValue))return NodeFilter.FILTER_REJECT;
    if(p.closest('.en,.ltr,.num-ltr,svg,textarea,script,style,code,.u'))return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT}});
  /* خلية جدول كلها أرقام (من غير حروف عربي) → اتجاهها LTR كاملة */
  Array.prototype.forEach.call(root.querySelectorAll('td,th'),function(c){if(!/[\u0600-\u06FF]/.test(c.textContent)&&/\d/.test(c.textContent)){c.setAttribute('dir','ltr');c.style.textAlign='right'}});
  var ns=[];while(w.nextNode())ns.push(w.currentNode);
  ns.forEach(function(n){
    var t=n.nodeValue,last=0,frag=document.createDocumentFragment(),m,hit=false;NUMRE.lastIndex=0;
    while((m=NUMRE.exec(t))){
      var st=m.index,tx=m[0];
      /* قوس من ناحية واحدة بس → نسيبه برّه العزل عشان مايتعكسش */
      var op=(tx.match(/\(/g)||[]).length,cl=(tx.match(/\)/g)||[]).length;
      while(op>cl&&tx.charAt(0)==='('){tx=tx.slice(1);st++;op--}
      while(cl>op&&tx.charAt(tx.length-1)===')'){tx=tx.slice(0,-1);cl--}
      if(!/\d/.test(tx))continue;
      if(!/[\u2212+\-−:×÷/%$]/.test(tx)&&!/,/.test(tx))continue;hit=true;
      if(st>last)frag.appendChild(document.createTextNode(t.slice(last,st)));
      var sp=document.createElement('span');sp.className=tx.length<=14?'num-ltr nw':'num-ltr';sp.textContent=tx;frag.appendChild(sp);last=st+tx.length}
    if(!hit)return; if(last<t.length)frag.appendChild(document.createTextNode(t.slice(last)));
    n.parentNode.replaceChild(frag,n);
  });
}

/* =====================================================================
   الراوتر
   ===================================================================== */
function route(){
  var hash=location.hash||'#/';
  var parts=hash.replace(/^#\//,'').split('/');
  var html;
  switch(parts[0]){
    case '': html=V.home(); break;
    case 'learn': html=parts[1]?V.lesson(parts[1]):V.learn(); break;
    case 'shariah': html=V.shariah(); break;
    case 'sources': html=V.sources(); break;
    case 'channel': html=V.channel(); break;
    case 'messages': html=parts[1]?V.message(parts[1]):V.messages(); break;
    case 'glossary': html=V.glossary(); break;
    case 'products': html=parts[1]?V.product(parts[1]):V.products(); break;
    case 'compare': html=V.compare(); break;
    case 'cases': html=parts[1]?V.case_(parts[1]):V.cases(); break;
    case 'recs': html=V.recs(); break;
    case 'warnings': html=V.warnings(); break;
    case 'quiz': html=V.quiz(); break;
    case 'refs': html=V.refs(parts[1]); break;
    case 'progress': html=V.progress(); break;
    case 'privacy': html=V.privacy(); break;
    default: html=notFound();
  }
  var view=$('#view'); view.innerHTML=html; ltrNums(view);
  markNav(hash.split('/').slice(0,2).join('/')===hash?hash:'#/'+parts[0]);
  closeMenu(); closePop();
  if(parts[0]==='refs'&&parts[1]){var row=$('#ref-'+parts[1]);if(row){row.style.background='var(--accent-soft)';row.scrollIntoView({block:'center'});return}}
  if(parts[0]==='glossary'&&parts[1]){var t=$('#term-'+parts[1]);if(t){t.open=true;t.scrollIntoView({block:'start'});return}}
  window.scrollTo(0,0);
  var tt=$('h1',view); document.title=(tt?tt.textContent+' — ':'')+'مركز البورصة الحلال';
}

/* =====================================================================
   البحث الشامل
   ===================================================================== */
var IDX=null;
function strip(h){return String(h||'').replace(/<[^>]+>/g,' ').replace(/\{\{[^}]+\}\}/g,'').replace(/\[\[[^|]+\|([^\]]+)\]\]/g,'$1')}
function norm(s){return String(s||'').toLowerCase().replace(/[إأآا]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[ً-ْـ]/g,'')}
function buildIndex(){
  IDX=[];
  (BH.lessons||[]).forEach(function(l){IDX.push({t:l.title,k:'درس',h:'#/learn/'+l.id,x:norm(l.title+' '+strip(l.summary)+' '+strip(l.body)+' '+strip(l.shariah)+' '+(l.examples||[]).map(function(e){return strip(e.html)}).join(' '))})});
  (BH.glossary||[]).forEach(function(t){IDX.push({t:t.ar+' — '+t.en,k:'مصطلح',h:'#/glossary/'+t.key,x:norm(t.ar+' '+t.en+' '+strip(t.def)),pri:2})});
  (BH.messages||[]).forEach(function(m){IDX.push({t:m.title,k:'رسالة',h:'#/messages/'+m.id,x:norm(m.title+' '+m.quickSummary+' '+m.original+' '+strip(m.simple))})});
  (BH.products||[]).forEach(function(p){IDX.push({t:p.name,k:'منتج',h:'#/products/'+p.id,x:norm(p.name+' '+(p.en||'')+' '+strip(p.nature)+' '+strip(p.reasons))})});
  (BH.cases||[]).forEach(function(c){IDX.push({t:c.title,k:'حالة حقيقية',h:'#/cases/'+c.id,x:norm(c.title+' '+(c.en||'')+' '+c.short+' '+strip(c.what))})});
  (BH.warnings||[]).forEach(function(w){IDX.push({t:w.title,k:'تحذير',h:'#/warnings',x:norm(w.title+' '+strip(w.html))})});
  (BH.refs||[]).forEach(function(r){IDX.push({t:r.id+' — '+r.title,k:'مرجع',h:'#/refs/'+r.id,x:norm(r.id+' '+r.title+' '+r.publisher+' '+strip(r.supports))})});
  ((BH.shariah||{}).topics||[]).forEach(function(t){IDX.push({t:t.title,k:'مرجع شرعي',h:'#/shariah',x:norm(t.title+' '+strip(t.quoted)+' '+strip(t.dispute))})});
}
function doSearch(q){
  if(!IDX)buildIndex();
  var nq=norm(q.trim()); var box=$('#results');
  if(nq.length<2){box.classList.remove('open');box.innerHTML='';return}
  var words=nq.split(/\s+/);
  var res=IDX.map(function(it){var s=0;var nt=norm(it.t);words.forEach(function(w){if(nt.indexOf(w)>=0)s+=5;else if(it.x.indexOf(w)>=0)s+=1;else s-=100});return {it:it,s:s+(it.pri||0)}}).filter(function(r){return r.s>0}).sort(function(a,b){return b.s-a.s}).slice(0,14);
  box.innerHTML=res.length?res.map(function(r,i){return '<a href="'+r.it.h+'" role="option"'+(i===0?' class="sel"':'')+'>'+esc(r.it.t)+'<small>'+r.it.k+'</small></a>'}).join(''):'<a href="#/glossary" style="color:var(--ink-3)">مفيش نتايج لـ «'+esc(q)+'». جرّب القاموس.</a>';
  box.classList.add('open');
}

/* =====================================================================
   المصطلحات المنبثقة
   ===================================================================== */
function openPop(btn){
  var t=termByKey[btn.getAttribute('data-term')];if(!t)return;
  var p=$('#pop');
  p.innerHTML='<b>'+esc(t.ar)+'</b><span class="en">'+esc(t.en)+'</span><p style="margin:6px 0">'+fmt(t.def)+'</p><a href="#/glossary/'+t.key+'">التفاصيل والمثال في القاموس ‹</a>';
  p.classList.add('open');
  var r=btn.getBoundingClientRect(), pw=Math.min(340,window.innerWidth-24);
  var left=Math.max(12,Math.min(window.innerWidth-pw-12,r.left+r.width/2-pw/2));
  p.style.left=left+'px';p.style.width=pw+'px';
  var top=r.bottom+8; if(top+p.offsetHeight>window.innerHeight-10) top=r.top-p.offsetHeight-8;
  p.style.top=Math.max(10,top)+'px';
}
function closePop(){$('#pop').classList.remove('open')}

/* =====================================================================
   التصدير إلى PDF (عن طريق طباعة المتصفح → حفظ كـ PDF)
   ===================================================================== */
function chapters(){
  var c=[];
  c.push({id:'overview',g:'عام',t:'ملخص تنفيذي وحالة الفحص',r:function(){return (BH.scan&&BH.scan.executive)?fmt(BH.scan.executive):''}});
  c.push({id:'privacy',g:'عام',t:'التشغيل والخصوصية',r:V.privacy});
  (BH.lessons||[]).forEach(function(l){c.push({id:'lesson:'+l.id,g:'الدروس',t:'درس '+l.n+': '+l.title,r:function(){return V.lesson(l.id)}})});
  c.push({id:'glossary',g:'مراجع تعليمية',t:'قاموس المصطلحات',r:function(){var f={q:'',d:''};return glossaryList(f)}});
  c.push({id:'shariah',g:'مراجع تعليمية',t:'المرجع الشرعي',r:V.shariah});
  c.push({id:'products',g:'مراجع تعليمية',t:'تقييم المنتجات المالية',r:function(){return (BH.products||[]).map(productDetail).join('')}});
  c.push({id:'compare',g:'مراجع تعليمية',t:'المقارنات',r:V.compare});
  c.push({id:'cases',g:'مراجع تعليمية',t:'حالات حقيقية موثقة',r:function(){return (BH.cases||[]).map(function(cs){return '<h2>'+esc(cs.title)+'</h2>'+caseBody(cs)}).join('')}});
  (BH.cases||[]).forEach(function(cs){c.push({id:'case:'+cs.id,g:'حالة واحدة',t:cs.title,hidden:true,r:function(){return caseBody(cs)}})});
  c.push({id:'sources',g:'فحص القناة',t:'فهرس المصادر وحالة الوصول',r:V.sources});
  c.push({id:'channel',g:'فحص القناة',t:'تقرير فحص قناة تليجرام وموثوقيتها',r:V.channel});
  (BH.messages||[]).forEach(function(m){c.push({id:'msg:'+m.id,g:'تحليل الرسائل',t:m.title,r:function(){return V.message(m.id)}})});
  c.push({id:'recs',g:'فحص القناة',t:'سجل التوصيات',r:V.recs});
  c.push({id:'warnings',g:'فحص القناة',t:'علامات التحذير',r:V.warnings});
  c.push({id:'refs',g:'المراجع',t:'سجل المراجع الكامل',r:function(){return refsTable(BH.refs||[])}});
  return c;
}
function openExport(preselect){
  var chs=chapters(), g='', h='';
  chs.forEach(function(c){if(c.hidden&&c.id!==preselect)return;if(c.g!==g){g=c.g;h+='<div class="grp">'+g+'</div>'}h+='<label><input type="checkbox" value="'+esc(c.id)+'"'+(preselect?(c.id===preselect?' checked':''):'checked')+'><span>'+esc(c.t)+'</span></label>'});
  $('#exportList').innerHTML=h;
  var d=$('#exportDlg'); if(d.showModal)d.showModal(); else d.setAttribute('open','');
}
function currentChapter(){
  var p=(location.hash||'#/').replace(/^#\//,'').split('/');
  var map={learn:p[1]?'lesson:'+p[1]:null,messages:p[1]?'msg:'+p[1]:null,cases:p[1]?'case:'+p[1]:'cases',glossary:'glossary',shariah:'shariah',products:'products',compare:'compare',sources:'sources',channel:'channel',recs:'recs',warnings:'warnings',refs:'refs',privacy:'privacy','':'overview'};
  return map[p[0]]||'overview';
}
function buildPrint(ids){
  var chs=chapters().filter(function(c){return ids.indexOf(c.id)>=0});
  PRINT=true; CITED={};
  var body=chs.map(function(c,i){return '<section class="pr-chapter" id="pr-'+i+'"><h1>'+esc(c.t)+'</h1>'+c.r().replace(/<nav class="crumbs[\s\S]*?<\/nav>/,'').replace(/<h1 class="page-title">[\s\S]*?<\/h1>/,'')+'</section>'}).join('');
  var cited=Object.keys(CITED);
  var refApp='';
  if(cited.length&&ids.indexOf('refs')<0){
    refApp='<section class="pr-chapter"><h1>المراجع المستخدمة في هذا الملف</h1><ol class="pr-reflist">'+cited.sort().map(function(id){var r=refById[id];return '<li><b>'+id+'</b> — '+esc(r.title)+' — '+esc(r.publisher||'')+(r.date?' ('+esc(r.date)+')':'')+'<br><a class="u" href="'+esc(r.url)+'">'+esc(r.url)+'</a><br><span style="font-size:8pt">حالة التحقق: '+(STATUS[r.status]||{t:r.status}).t+' — تاريخ التحقق: '+esc(r.checked||'—')+'</span></li>'}).join('')+'</ol></section>';
  }
  PRINT=false; CITED=null;
  var now=new Date();
  var title=chs.length===1?chs[0].t:'تقرير التعلّم والفحص — البورصة الحلال';
  var cover='<div class="pr-cover"><div class="band"></div><div><div style="font-size:11pt;color:#1f5f63;font-weight:700;margin-bottom:6mm">مركز البورصة الحلال — نسخة شخصية</div><h1>'+esc(title)+'</h1><div class="sub">تعلّم الاستثمار والتداول من الصفر، بالأحكام الشرعية وأدلتها، وفحص محايد لمحتوى قناة «Borsa Halal».</div></div>'+
    '<div><div class="meta"><div>تاريخ إنشاء الملف: '+now.toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'})+'</div><div>آخر تحديث لمحتوى الموقع: '+esc((BH.scan||{}).updated||'')+'</div><div>عدد الأجزاء: '+chs.length+'</div></div>'+
    '<div class="disc">محتوى تعليمي، ليس فتوى ولا توصية بالشراء أو البيع. الأسعار والرسوم والقوانين وحالة المنصات تتغير — راجعها قبل أي قرار. هذا الملف نسخة مستقلة: أي تحديث لاحق في الموقع لن يظهر فيه تلقائيًا.</div></div></div>';
  var toc=chs.length>1?'<div class="pr-toc"><h2>المحتويات</h2><ol>'+chs.map(function(c,i){return '<li><a href="#pr-'+i+'">'+esc(c.t)+'</a></li>'}).join('')+(refApp?'<li>المراجع المستخدمة في هذا الملف</li>':'')+'</ol></div>':'';
  $('#print-root').innerHTML=cover+toc+body+refApp; ltrNums($('#print-root'));
  document.title=title;
}
function doPrint(ids){
  buildPrint(ids);
  setTimeout(function(){window.print()},120);
}
window.addEventListener('afterprint',function(){$('#print-root').innerHTML='';route()});
window.addEventListener('beforeprint',function(){if(!$('#print-root').innerHTML)buildPrint([currentChapter()])});
/* واجهة لتوليد ملفات PDF آليًا (يستخدمها سكربت التصدير المحلي فقط) */
window.BH_buildPrint=function(ids){if(ids==='all')ids=chapters().filter(function(c){return !c.hidden}).map(function(c){return c.id});buildPrint(ids);return chapters().length};
window.BH_chapters=function(){return chapters().map(function(c){return {id:c.id,t:c.t,g:c.g,hidden:!!c.hidden}})};

/* =====================================================================
   الأحداث
   ===================================================================== */
function closeMenu(){$('#sidebar').classList.remove('open');$('#scrim').classList.remove('open')}
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-term]'); if(t){e.preventDefault();openPop(t);return}
  if(!e.target.closest('#pop'))closePop();
  if(!e.target.closest('.search'))$('#results').classList.remove('open');
  var b;
  if((b=e.target.closest('[data-prog]'))){var cur=(progress()[b.dataset.prog]||{}).s;setProgress(b.dataset.prog,cur===b.dataset.v?null:b.dataset.v);toast(cur===b.dataset.v?'اتشال التحديد':'اتسجّل: '+PSTAT[b.dataset.v]);route();return}
  if((b=e.target.closest('[data-fav]'))){var on=toggleFav(b.dataset.fav,b.dataset.title);toast(on?'اتضاف للمفضلة':'اتشال من المفضلة');route();return}
  if((b=e.target.closest('[data-export]'))){openExport(b.dataset.export);return}
  if((b=e.target.closest('.quiz .opt'))){var q=b.closest('.q');var key=q.dataset.quiz,k=+q.dataset.k;var a=store.get(key,{});a[k]=+b.dataset.j;store.set(key,a);var y=window.scrollY;route();window.scrollTo(0,y);var nq=$('.q[data-quiz="'+key+'"][data-k="'+k+'"]');if(nq){var d=nq.closest('details');if(d)d.open=true}return}
  if((b=e.target.closest('[data-flt]'))&&b.classList.contains('chip')){var f=store.get('f.learn',{lv:'',dm:''});f[b.dataset.flt]=b.dataset.v;store.set('f.learn',f);route();return}
  if((b=e.target.closest('[data-flt-w]'))){store.set('f.w',{t:b.dataset.fltW});route();return}
  if(e.target.id==='resetQuiz'){if(confirm('تمسح كل إجابات الاختبارات؟')){(BH.lessons||[]).forEach(function(l){store.del('q.'+l.id)});route()}return}
  if(e.target.closest('#dataExport')){var dump={};store.keys().forEach(function(k){try{dump[k]=JSON.parse(localStorage.getItem(k))}catch(x){}});var blob=new Blob([JSON.stringify(dump,null,2)],{type:'application/json'});var a2=document.createElement('a');a2.href=URL.createObjectURL(blob);a2.download='borsa-halal-my-notes-'+new Date().toISOString().slice(0,10)+'.json';a2.click();setTimeout(function(){URL.revokeObjectURL(a2.href)},1000);return}
  if(e.target.closest('#dataClear')){if(confirm('هتمسح كل ملاحظاتك وتقدّمك ومفضلتك من المتصفح ده. متأكد؟')){store.keys().forEach(function(k){try{localStorage.removeItem(k)}catch(x){}});toast('اتمسحت كل البيانات المحلية');route()}return}
  if(e.target.id==='selAll'){$$('#exportList input').forEach(function(i){i.checked=true});return}
  if(e.target.id==='selNone'){$$('#exportList input').forEach(function(i){i.checked=false});return}
  if(e.target.id==='selCur'){var cc=currentChapter();$$('#exportList input').forEach(function(i){i.checked=i.value===cc});return}
});
document.addEventListener('change',function(e){
  var t=e.target;
  if(t.matches('select[data-flt]')){var f=store.get('f.learn',{lv:'',dm:''});f[t.dataset.flt]=t.value;store.set('f.learn',f);route()}
  if(t.matches('[data-flt-msg]')&&t.tagName==='SELECT'){var m=store.get('f.msg',{c:'',s:'',q:''});m[t.dataset.fltMsg]=t.value;store.set('f.msg',m);route()}
  if(t.matches('[data-flt-pr]')){var p=store.get('f.pr',{s:'',r:''});p[t.dataset.fltPr]=t.value;store.set('f.pr',p);route()}
  if(t.matches('[data-flt-refs]')){var r=store.get('f.refs',{s:'',t:''});r[t.dataset.fltRefs]=t.value;store.set('f.refs',r);route()}
  if(t.id==='gld'){var g=store.get('f.gl',{q:'',d:''});g.d=t.value;store.set('f.gl',g);$('#glbox').innerHTML=glossaryList(g);ltrNums($('#glbox'))}
  if(t.matches('[data-chk]')){var c=store.get('chk.'+t.dataset.chk,{});c[t.dataset.i]=t.checked;store.set('chk.'+t.dataset.chk,c)}
  if(t.id==='dataImport'&&t.files[0]){var rd=new FileReader();rd.onload=function(){try{var o=JSON.parse(rd.result);Object.keys(o).forEach(function(k){if(k.indexOf('bh.')===0)localStorage.setItem(k,JSON.stringify(o[k]))});toast('تم الاستيراد');route()}catch(x){toast('الملف مش صالح')}};rd.readAsText(t.files[0])}
});
var noteT;
document.addEventListener('input',function(e){
  var t=e.target;
  if(t.matches('textarea[data-note]')){clearTimeout(noteT);noteT=setTimeout(function(){setNote(t.dataset.note,t.dataset.title,t.value);var m=t.parentNode.querySelector('.note-meta');if(m)m.firstChild.textContent='اتحفظ ✓ '}  ,500)}
  if(t.id==='glq'){var g=store.get('f.gl',{q:'',d:''});g.q=t.value;store.set('f.gl',g);$('#glbox').innerHTML=glossaryList(g);ltrNums($('#glbox'))}
  if(t.matches('input[data-flt-msg]')){var m=store.get('f.msg',{c:'',s:'',q:''});m.q=t.value;store.set('f.msg',m);clearTimeout(t._t);t._t=setTimeout(function(){route();var i=$('input[data-flt-msg]');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},350)}
  if(t.id==='q')doSearch(t.value);
});
document.addEventListener('keydown',function(e){
  if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#q').focus()}
  if(e.key==='Escape'){closePop();$('#results').classList.remove('open');closeMenu()}
  if(document.activeElement.id==='q'&&(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Enter')){
    var as=$$('#results a');if(!as.length)return;var i=as.findIndex(function(a){return a.classList.contains('sel')});
    if(e.key==='Enter'){e.preventDefault();var a=as[Math.max(0,i)];location.hash=a.getAttribute('href');$('#results').classList.remove('open');$('#q').value='';return}
    e.preventDefault();if(i>=0)as[i].classList.remove('sel');i=(i+(e.key==='ArrowDown'?1:-1)+as.length)%as.length;as[i].classList.add('sel');as[i].scrollIntoView({block:'nearest'});
  }
});
$('#results').addEventListener('click',function(){$('#results').classList.remove('open');$('#q').value=''});
$('#menuBtn').addEventListener('click',function(){$('#sidebar').classList.add('open');$('#scrim').classList.add('open')});
$('#scrim').addEventListener('click',closeMenu);
$('#themeBtn').addEventListener('click',function(){
  var cur=document.documentElement.getAttribute('data-theme');
  var dark=cur?cur==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
  var nx=dark?'light':'dark';document.documentElement.setAttribute('data-theme',nx);try{localStorage.setItem('bh.theme',nx)}catch(e){}
});
$('#exportBtn').addEventListener('click',function(){openExport(null)});
$('#dlgCancel').addEventListener('click',function(){$('#exportDlg').close()});
$('#dlgPrint').addEventListener('click',function(){
  var ids=$$('#exportList input:checked').map(function(i){return i.value});
  if(!ids.length){toast('اختار جزء واحد على الأقل');return}
  $('#exportDlg').close();doPrint(ids);
});
window.addEventListener('hashchange',route);
window.addEventListener('scroll',closePop,{passive:true});

$('#updated').textContent=(BH.scan||{}).updated||'';
renderNav();
route();
})();
