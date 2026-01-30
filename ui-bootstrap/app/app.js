(function(){
  const API = '__API__'; // workflow will replace this with your real API URL
  const out = id('out');
  const pTitle = id('panel-title');
  const pBody  = id('panel-body');

  id('btnPins').onclick        = () => getJSON(`${API}/pins`);
  id('btnJournal').onclick     = () => getJSON(`${API}/journal?userId=demo&journalId=demo`);
  id('btnPostPin').onclick     = () => postJSON(`${API}/pins`, { userId:'demo', pinId:Date.now().toString(), lat:38.15, lon:-90.72, category:'demo' });
  id('btnPostJournal').onclick = () => postJSON(`${API}/journal`, { userId:'demo', journalId:Date.now().toString(), note:'Hello from HUNTΞCH' });

  window.route = (name)=>{
    pTitle.textContent = name.charAt(0).toUpperCase()+name.slice(1);
    pBody.innerHTML = ({
      shed: '<ul><li>New grid</li><li>Mark find</li><li>Export KML</li></ul>',
      fly: '<ul><li>Flows</li><li>Access</li><li>Wade/Float</li></ul>',
      whitetail: '<ul><li>Funnels</li><li>300‑yd sits</li><li>Access</li></ul>'
    })[name] || 'Select a module.';
  };

  function id(x){ return document.getElementById(x); }
  async function getJSON(url){
    out.textContent = `GET ${url} ...`;
    try{
      const r = await fetch(url);
      const t = await r.text();
      out.textContent = `Status ${r.status}\n\n${t}`;
    }catch(e){ out.textContent = String(e); }
  }
  async function postJSON(url, body){
    out.textContent = `POST ${url} ...`;
    try{
      const r = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const t = await r.text();
      out.textContent = `Status ${r.status}\n\n${t}`;
    }catch(e){ out.textContent = String(e); }
  }
})();
``
