import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const workspaceSlug = req.nextUrl.searchParams.get("workspace");
  if (!workspaceSlug) return new Response("// Missing workspace", { status: 400, headers: { "Content-Type": "application/javascript" } });

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { chatWidget: { select: { id: true, enabled: true, widgetColor: true, welcomeMessage: true, teamName: true } } },
  });

  const cfg = workspace?.chatWidget ?? { enabled: true, widgetColor: "#F59E0B", welcomeMessage: "Hi! How can we help?", teamName: "Support" };
  if (!cfg.enabled) return new Response("// Widget disabled", { headers: { "Content-Type": "application/javascript" } });

  const apiBase = req.nextUrl.origin;
  const script = buildWidgetScript({ workspaceSlug, apiBase, ...cfg });

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function buildWidgetScript({ workspaceSlug, apiBase, widgetColor, welcomeMessage, teamName }: {
  workspaceSlug: string; apiBase: string; widgetColor: string; welcomeMessage: string; teamName: string;
}) {
  return `(function(){
  var C={ws:${JSON.stringify(workspaceSlug)},api:${JSON.stringify(apiBase)},color:${JSON.stringify(widgetColor)},team:${JSON.stringify(teamName)}};
  var vid=localStorage.getItem('_stactoro_vid');
  if(!vid){vid='v'+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem('_stactoro_vid',vid);}
  var convId=null,open=false,polling=null;

  // Inject styles
  var st=document.createElement('style');
  st.textContent='#_stct-btn{position:fixed;bottom:24px;right:24px;z-index:2147483647;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.25);transition:transform .2s;}#_stct-btn:hover{transform:scale(1.08);}#_stct-win{position:fixed;bottom:96px;right:24px;z-index:2147483646;width:360px;max-height:520px;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.18);background:#fff;display:none;flex-direction:column;font-family:system-ui,sans-serif;overflow:hidden;}#_stct-head{padding:16px;display:flex;align-items:center;gap:10px;}#_stct-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:180px;max-height:320px;}._stct-msg{max-width:80%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;word-break:break-word;}._stct-visitor{align-self:flex-end;color:#fff;}._stct-agent,._stct-ai{align-self:flex-start;background:#f3f4f6;color:#111;}#_stct-inp{display:flex;border-top:1px solid #e5e7eb;padding:10px;}#_stct-inp input{flex:1;border:none;outline:none;font-size:14px;padding:4px 8px;}#_stct-inp button{border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#fff;}';
  document.head.appendChild(st);

  // Button
  var btn=document.createElement('button');
  btn.id='_stct-btn';
  btn.style.background=C.color;
  btn.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  document.body.appendChild(btn);

  // Window
  var win=document.createElement('div');
  win.id='_stct-win';
  win.innerHTML='<div id="_stct-head" style="background:'+C.color+'"><div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">'+C.team[0].toUpperCase()+'</div><div><p style="margin:0;font-weight:600;color:#fff;font-size:14px;">'+C.team+'</p><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.8);">Online</p></div><button onclick="toggleWin()" style="margin-left:auto;background:none;border:none;cursor:pointer;color:#fff;font-size:18px;">×</button></div><div id="_stct-msgs"></div><div id="_stct-inp"><input id="_stct-input" placeholder="Type a message..." onkeydown="if(event.key===\'Enter\')sendMsg()"/><button onclick="sendMsg()" style="background:'+C.color+'">Send</button></div>';
  document.body.appendChild(win);

  function toggleWin(){open=!open;win.style.display=open?'flex':'none';if(open&&!convId)startConv();}
  btn.onclick=toggleWin;

  function startConv(){
    fetch(C.api+'/api/chat/conversations?workspace='+C.ws,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId:vid})})
    .then(function(r){return r.json();}).then(function(d){
      convId=d.conversation.id;
      renderMsgs(d.conversation.messages||[]);
      startPolling();
    }).catch(function(){});
  }

  var lastCount=0;
  function startPolling(){if(polling)clearInterval(polling);polling=setInterval(function(){pollMsgs();},3000);}
  function pollMsgs(){
    if(!convId)return;
    fetch(C.api+'/api/chat/conversations/'+convId+'/messages').then(function(r){return r.json();}).then(function(d){
      if((d.messages||[]).length!==lastCount){renderMsgs(d.messages);lastCount=d.messages.length;}
    }).catch(function(){});
  }

  function renderMsgs(msgs){
    var el=document.getElementById('_stct-msgs');
    el.innerHTML='';
    (msgs||[]).forEach(function(m){
      var d=document.createElement('div');
      d.className='_stct-msg _stct-'+m.role;
      if(m.role==='visitor')d.style.background=C.color;
      d.textContent=m.content;
      el.appendChild(d);
    });
    lastCount=(msgs||[]).length;
    el.scrollTop=el.scrollHeight;
  }

  function sendMsg(){
    var inp=document.getElementById('_stct-input');
    var txt=(inp.value||'').trim();
    if(!txt||!convId)return;
    inp.value='';
    fetch(C.api+'/api/chat/conversations/'+convId+'/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'visitor',content:txt,visitorId:vid})})
    .then(function(){pollMsgs();}).catch(function(){});
  }

  window.toggleWin=toggleWin;
  window.sendMsg=sendMsg;
})();`;
}
