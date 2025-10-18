
// Common app script for SUSIA prototype
function el(q){ return document.querySelector(q); }
function elAll(q){ return document.querySelectorAll(q); }

// Chat logic (index page)
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', ()=>{
    // if chat exists on this page, setup it
    const messagesEl = el('#messages');
    const inputEl = el('#input');
    const sendBtn = el('#send');
    const micBtn = el('#mic');

    if (messagesEl && inputEl && sendBtn){
      addMessage("Olá! Eu sou a SUSIA, sua assistente de saúde. Como posso te ajudar hoje?", 'susia');
      sendBtn.addEventListener('click', ()=> {
        const v = inputEl.value.trim();
        if(!v) return;
        addMessage(v, 'user');
        inputEl.value='';
        setTimeout(()=> addMessage(generateReply(v), 'susia'), 600);
      });
      inputEl.addEventListener('keydown', (e)=> { if (e.key==='Enter'){ e.preventDefault(); sendBtn.click(); } });
      // quick actions
      window.quick = function(text){ inputEl.value = text; sendBtn.click(); }
    }

    // microphone
    if (micBtn){
      let recognition;
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
        const R = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new R();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;
        recognition.onresult = (ev)=>{
          const transcript = Array.from(ev.results).map(r=>r[0].transcript).join('');
          inputEl.value = transcript;
          sendBtn.click();
        };
        recognition.onend = ()=> micBtn.textContent = '🎙️';
      } else {
        micBtn.title = 'Reconhecimento de voz não disponível';
      }
      micBtn.addEventListener('click', ()=> {
        if (!recognition){ alert('Reconhecimento de voz não disponível'); return; }
        try{ recognition.start(); micBtn.textContent = '...'; } catch(e){ console.error(e); }
      });
    }

    // If "Meus Dados" section exists, render user data
    const modoDados = el('#meus-dados-root');
    if (modoDados){
      const u = window.SUS_MOCK_USER || {};
      // render header
      modoDados.innerHTML = `
        <div class="card">
          <h2>👤 Dados do Cidadão</h2>
          <div style="margin-top:8px"><strong>Nome:</strong> ${u.nome}</div>
          <div style="margin-top:6px"><strong>CPF:</strong> ${u.cpf}</div>
        </div>
        <div class="data-grid" style="margin-top:12px">
          <div class="data-card">
            <h3>🩺 Consultas marcadas</h3>
            <ul>
              ${ (u.consultas||[]).map(c=>`<li>📅 <strong>${c.especialidade}</strong> — ${formatDate(c.data)} — <em>${c.local}</em></li>`).join('') }
            </ul>
          </div>
          <div class="data-card">
            <h3>💊 Receitas</h3>
            <ul>
              ${ (u.receitas||[]).map(r=>`<li>💊 <strong>${r.medicamento}</strong> — válida até <em>${formatDate(r.validade)}</em></li>`).join('') }
            </ul>
          </div>
        </div>
        <div style="margin-top:12px" class="data-grid">
          <div class="data-card">
            <h3>💉 Vacinas</h3>
            <ul>
              ${ (u.vacinas||[]).map(v=>`<li>💉 ${v.nome} — aplicada em ${formatDate(v.data)}</li>`).join('') }
            </ul>
          </div>
          <div class="data-card">
            <h3>🔬 Exames disponíveis</h3>
            <ul>${ (u.exames||[]).map(e=>`<li>${e}</li>`).join('') }</ul>
          </div>
        </div>
      `;
      // also render unidades proximas as quick list
      const unidadesRoot = el('#unidades-list');
      if (unidadesRoot){
        unidadesRoot.innerHTML = (u.unidades_proximas||[]).map(u2=>`<div style="padding:8px;border-radius:8px;border:1px solid #eef6ff;margin-bottom:8px;"><strong>${u2.nome}</strong><div style="font-size:13px;color:#65748b">Distância: ${u2.distancia_km} km • ${u2.telefone}</div></div>`).join('');
      }
    }

  }); // DOMContentLoaded
}

// helper functions for chat DOM
function addMessage(text, from='susia'){
  const messagesEl = document.getElementById('messages');
  if(!messagesEl) return;
  const div = document.createElement('div');
  div.className = 'msg ' + (from==='susia' ? 'susia' : 'user');
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function generateReply(text){
  const t = text.toLowerCase();
  if (t.includes('marcar') || t.includes('consulta')){
    // simulate scheduling: if mentions clinico etc, pretend scheduled
    if (t.includes('clínico') || t.includes('clinico') || t.includes('geral')){
      return 'Consulta em Clínico Geral agendada para 02/11/2025 às 09:00 na UBS Centro. Deseja receber lembrete por SMS?';
    }
    return 'Posso ajudar a marcar uma consulta. Você prefere "Clínico Geral", "Especialista" ou "Odontologia"?';
  }
  if (t.includes('posto') || t.includes('próximo') || t.includes('perto')){
    const u = window.SUS_MOCK_USER || {};
    return 'Unidades próximas: ' + (u.unidades_proximas||[]).slice(0,3).map(x=>`${x.nome} (${x.distancia_km}km)`).join(', ')+'. Deseja ver no mapa?';
  }
  if (t.includes('receita')){
    return 'Para renovar a receita, preciso confirmar seu CPF. Deseja prosseguir?';
  }
  if (t.includes('vacina')){
    return 'Seu histórico de vacinas mostra '+ (window.SUS_MOCK_USER.vacinas.length) + ' registros. Posso sugerir locais para completar doses pendentes.';
  }
  if (t.includes('meus dados') || t.includes('minha')){
    return 'Estou abrindo seu painel de dados. Clique em "Meus Dados" no menu para ver todas as informações.';
  }
  return 'Posso: 1) Agendar consulta 2) Mostrar unidades próximas 3) Renovar receita. Diga a opção ou pergunte em linguagem natural.';
}

function formatDate(d){
  if(!d) return '';
  // try iso or dd/mm/yyyy
  const isod = d.includes('-') ? new Date(d.replace(' ', 'T')) : new Date(d);
  if (isNaN(isod)) return d;
  return isod.toLocaleDateString('pt-BR') + (d.includes(':') ? ' às ' + isod.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '');
}

// simple navigation highlight
document.addEventListener('DOMContentLoaded', ()=>{
  const path = location.pathname.split('/').pop();
  const links = document.querySelectorAll('nav a');
  links.forEach(a=>{ if (a.getAttribute('href') === path || (a.getAttribute('href')==='index.html' && (path===''||path==='index.html'))){ a.style.color='var(--primary)'; a.style.fontWeight='700'; } });
});
