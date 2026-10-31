import { firebaseConfig } from './firebase-config.js';

import {
  initializeApp
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';

import {
  getAuth,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const money = n =>
  Number(n || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

const seed = {

  trip: {
    id: 'demo-gramado',
    name: 'Gramado & Canela',
    destination: 'Gramado, RS',
    budget: 10385.28
  },

  expenses: [

    {
      id: 'e1',
      name: 'Passagem aérea',
      category: 'Transporte',
      amount: 1958,
      method: 'Cartão',
      installments: 10,
      paid: true
    },

    {
      id: 'e2',
      name: 'Hotel Buona Vitta Gramado Resort',
      category: 'Hospedagem',
      amount: 1390.32,
      method: 'Cartão',
      installments: 12,
      paid: true
    },

    {
      id: 'e3',
      name: 'Prime Gourmet',
      category: 'Alimentação',
      amount: 200,
      method: 'Cartão',
      installments: 10,
      paid: true
    },

    {
      id: 'e4',
      name: 'Passeios',
      category: 'Passeios',
      amount: 2308,
      method: 'Dinheiro ou cartão',
      installments: 0,
      paid: true
    },

    {
      id: 'e5',
      name: 'Alimentação',
      category: 'Alimentação',
      amount: 1700,
      method: 'Dinheiro ou cartão',
      installments: 11,
      paid: true
    },

    {
      id: 'e6',
      name: 'Estacionamento hotel',
      category: 'Transporte',
      amount: 225,
      method: 'Dinheiro',
      installments: 11,
      paid: false
    },

    {
      id: 'e7',
      name: 'Carro alugado',
      category: 'Transporte',
      amount: 553.96,
      method: 'Dinheiro',
      installments: 0,
      paid: false
    },

    {
      id: 'e8',
      name: 'Beleza Raquel e Matheus',
      category: 'Pessoal',
      amount: 850,
      method: 'Dinheiro',
      installments: 11,
      paid: true
    },

    {
      id: 'e9',
      name: 'Roupas',
      category: 'Compras',
      amount: 1000,
      method: 'Cartão',
      installments: 11,
      paid: true
    },

    {
      id: 'e10',
      name: 'Lembrancinhas',
      category: 'Compras',
      amount: 200,
      method: 'Dinheiro',
      installments: 11,
      paid: true
    }

  ],

  activities: [

    ['NBA','Gramado',249,true,'Cartão',3],
    ['Garden Park Gramado','Gramado',140,true,'Dinheiro',0],
    ['Alpen Park Pacote','Canela',138,true,'Cartão',4],
    ['Passeio avenida Borges de Medeiros','Gramado',0,true,'—',0],
    ['Lago Negro + Pedalinho','Gramado',70,true,'Dinheiro',10],
    ['Tour Pé da Cascata','Canela',700,true,'Cartão',6],
    ['Catedral de Canela','Canela',0,true,'—',0],
    ['Minimundo (Prime Gourmet)','Gramado',217,true,'Dinheiro',10],
    ['Vinícola Jolimont (Prime Gourmet)','Canela',189,true,'Dinheiro',10],
    ['Acqua Motion (Prime Gourmet)','Gramado',239,true,'Dinheiro',10],
    ['Lumini','Gramado',150,false,'—',0],
    ['Super Carros','Gramado',0,false,'—',0]

  ].map((a,i) => ({

    id: 'a' + i,
    name: a[0],
    city: a[1],
    amount: a[2],
    paid: a[3],
    method: a[4],
    installments: a[5]

  })),

  restaurants: [

    ['Pizzaria Cara de Mau','Gramado',350,'Jantar / rodízio','Dinheiro',true],
    ['Restaurante Bella Gramado','Gramado',100,'Almoço','Dinheiro',false],
    ["Fondue Château d’ Geneve",'Gramado',200,'Fondue','Dinheiro',false],
    ['Restaurante Vó Eli','Canela',100,'Almoço','Dinheiro',false],
    ['Nostri Nonni','Gramado',200,'Jantar','Dinheiro',false],
    ['Casa da Vó Ivone','Canela',0,'Almoço','—',true],
    ['Johnny Rockets','Gramado',200,'Jantar','Cartão',false],
    ['Acqua Motion - Almoço','Gramado',100,'Almoço','Dinheiro',false],
    ['Royal Trudel','Gramado',30,'Lanche','Dinheiro',false],
    ['Casa da Velha Bruxa','Gramado',60,'Lanche','Dinheiro',false],
    ['Panini Sanduíche','Gramado',60,'Lanche','Dinheiro',false]

  ].map((r,i) => ({

    id: 'r' + i,
    name: r[0],
    city: r[1],
    amount: r[2],
    type: r[3],
    method: r[4],
    paid: r[5]

  })),

  tasks: [

    ['Definir documentos da viagem','Documentos'],
    ['Conferir reservas e vouchers','Organização'],
    ['Separar roupas e calçados','Mala'],
    ['Verificar documentos do carro','Transporte'],
    ['Planejar dinheiro e cartões','Financeiro'],
    ['Preparar itens pessoais','Mala']

  ].map((t,i) => ({

    id: 't' + i,
    name: t[0],
    group: t[1],
    done: false

  }))

};

let state = structuredClone(seed);

let db = null;
let auth = null;
let user = null;
let firebaseReady = false;

let activeView = 'overview';

const $ = s => document.querySelector(s);

const $$ = s => [...document.querySelectorAll(s)];

function toast(msg) {

  const el = $('#toast');

  el.textContent = msg;

  el.classList.add('show');

  setTimeout(() => {
    el.classList.remove('show');
  }, 2400);

}

function totals() {

  const total = state.expenses.reduce(
    (s,x) => s + Number(x.amount || 0), 0
  );

  const paid = state.expenses
    .filter(x => x.paid)
    .reduce((s,x) => s + Number(x.amount || 0), 0);

  return {
    total,
    paid,
    pending: total - paid
  };

}

function render() {

  const t = totals();

  const pct = t.total
    ? Math.round(t.paid / t.total * 1000) / 10
    : 0;

  $('#budgetTotal').textContent = money(t.total);

  $('#paidTotal').textContent = money(t.paid);

  $('#pendingTotal').textContent = money(t.pending);

  $('#paidPercent').textContent =
    pct.toLocaleString('pt-BR') + '%';

  $('#budgetUsed').textContent = money(t.paid);

  $('#budgetCap').textContent =
    money(state.trip.budget || t.total);

  $('#budgetProgress').style.width = pct + '%';

  $('#activityCount').textContent =
    state.activities.length;

  $('#sideTripName').textContent = state.trip.name;

  $('#crumbTitle').textContent = state.trip.name;

  $('#pageTitle').innerHTML =
    state.trip.name +
    ' <span class="edit-title" title="Editar viagem">✎</span>';

  $('#pageTitle .edit-title').onclick = () => openForm('trip');

  $('#sideTripDates').textContent =
    state.trip.destination || 'Minha viagem';

  $('#categorySummary').innerHTML = Object.entries(

    state.expenses.reduce((o,x) => {

      o[x.category] =
        (o[x.category] || 0) + Number(x.amount || 0);

      return o;

    }, {})

  ).map(([k,v]) => `

    <div class="category-item">
      <span>${k}</span>
      <b>${money(v)}</b>
    </div>

  `).join('');

  $('#taskSummary').innerHTML =
    state.tasks.slice(0,4).map(x => `

      <label class="task-row ${x.done ? 'done' : ''}">

        <input
          type="checkbox"
          data-task="${x.id}"
          ${x.done ? 'checked' : ''}
        >

        <span>${esc(x.name)}</span>

      </label>

    `).join('');

  $('#recentExpenses').innerHTML =
    state.expenses.slice(0,5).map(expenseRow).join('');

  $('#expenseRows').innerHTML =
    state.expenses.map(expenseRowFull).join('');

  $('#expBudget').textContent = money(t.total);

  $('#expPaid').textContent = money(t.paid);

  $('#expPending').textContent = money(t.pending);

  $('#activityGrid').innerHTML =
    state.activities.map((x,i) => tile(x,'activity',i)).join('');

  $('#restaurantGrid').innerHTML =
    state.restaurants.map((x,i) => tile(x,'restaurant',i)).join('');

  $('#checklistItems').innerHTML =
    state.tasks.map(x => `

      <label class="check-item ${x.done ? 'done' : ''}">

        <input
          type="checkbox"
          data-task="${x.id}"
          ${x.done ? 'checked' : ''}
        >

        <span>
          ${esc(x.name)}
          <small>${esc(x.group)}</small>
        </span>

      </label>

    `).join('');

  const done = state.tasks.filter(x => x.done).length;

  $('#checkProgressText').textContent =
    `${done} de ${state.tasks.length} concluídos`;

  $('#checkProgressBar').style.width =
    (state.tasks.length ? done / state.tasks.length * 100 : 0) + '%';

}

function expenseRow(x) {

  return `

    <tr>

      <td>${esc(x.name)}</td>

      <td>${esc(x.category)}</td>

      <td>${money(x.amount)}</td>

      <td>${esc(x.method || '—')}</td>

      <td>
        <span class="status ${x.paid ? 'paid' : 'pending'}">
          ${x.paid ? 'Pago' : 'Pendente'}
        </span>
      </td>

    </tr>

  `;

}

function expenseRowFull(x) {

  return `

    <tr>

      <td>${esc(x.name)}</td>

      <td>${esc(x.category)}</td>

      <td>${money(x.amount)}</td>

      <td>${esc(x.method || '—')}</td>

      <td>${x.installments ? x.installments + 'x' : 'À vista'}</td>

      <td>

        <button
          class="status ${x.paid ? 'paid' : 'pending'}"
          data-paid="${x.id}"
        >

          ${x.paid ? 'Pago ✓' : 'Marcar pago'}

        </button>

      </td>

    </tr>

  `;

}

function tile(x,type,i) {

  const emoji = type === 'activity' ? '🎟️' : '🍽️';

  return `

    <article class="tile">

      <div class="tile-top">

        <div class="tile-emoji">${emoji}</div>

        <span class="status ${x.paid ? 'paid' : 'pending'}">
          ${x.paid ? 'Pago' : 'A pagar'}
        </span>

      </div>

      <h3>${esc(x.name)}</h3>

      <p>
        ⌖ ${esc(x.city || 'Destino não informado')}
        ${x.type ? ' · ' + esc(x.type) : ''}
      </p>

      <div class="tile-bottom">

        <span>${esc(x.method || 'Forma não definida')}</span>

        <strong>${money(x.amount)}</strong>

      </div>

    </article>

  `;

}

function esc(s) {

  return String(s ?? '').replace(/[&<>"']/g,c => ({

    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'

  }[c]));

}

function navigate(view) {

  activeView = view;

  $$('.view').forEach(x =>
    x.classList.remove('active')
  );

  $('#' + view + 'View').classList.add('active');

  $$('.nav-item').forEach(x =>
    x.classList.toggle('active',x.dataset.view === view)
  );

  const labels = {

    overview: [
      'SUA PRÓXIMA AVENTURA',
      'Visão geral',
      'Adicionar despesa'
    ],

    expenses: [
      'ORGANIZE SEU ORÇAMENTO',
      'Financeiro',
      'Adicionar despesa'
    ],

    activities: [
      'VIVA EXPERIÊNCIAS',
      'Passeios',
      'Adicionar passeio'
    ],

    restaurants: [
      'SABORES DA VIAGEM',
      'Restaurantes',
      'Adicionar restaurante'
    ],

    itinerary: [
      'CADA DIA, UMA DESCOBERTA',
      'Roteiro diário',
      'Adicionar atividade'
    ],

    checklist: [
      'TUDO PRONTO PARA VIAJAR',
      'Checklist',
      'Adicionar tarefa'
    ]

  };

  $('#pageEyebrow').textContent = labels[view][0];

  $('#pageTitle').textContent = labels[view][1];

  $('#pageSubtitle').textContent =
    view === 'overview'
      ? 'Tudo organizado para você aproveitar cada momento.'
      : 'Organize os detalhes da sua viagem em um só lugar.';

  $('#addBtnText').textContent = labels[view][2];

  $('#addBtn').onclick = () => openForm(

    view === 'overview' || view === 'expenses'
      ? 'expense'
      : view === 'activities'
      ? 'activity'
      : view === 'restaurants'
      ? 'restaurant'
      : view === 'checklist'
      ? 'task'
      : 'plan'

  );

}

$$('.nav-item').forEach(x => {

  x.addEventListener('click',() => {

    navigate(x.dataset.view);

    $('#sidebar').classList.remove('open');

  });

});

$$('[data-goto]').forEach(x => {

  x.addEventListener('click',() =>
    navigate(x.dataset.goto)
  );

});

$('#mobileMenu').onclick = () =>
  $('#sidebar').classList.toggle('open');

$('#addBtn').onclick = () => openForm('expense');

$('#newExpense').onclick = () => openForm('expense');

$('#newActivity').onclick = () => openForm('activity');

$('#newRestaurant').onclick = () => openForm('restaurant');

$('#newTask').onclick = () => openForm('task');

$('#newPlan').onclick =
$('#startPlan').onclick = () => openForm('plan');

document.addEventListener('change',async e => {

  if (e.target.dataset.task) {

    const x = state.tasks.find(
      t => t.id === e.target.dataset.task
    );

    if (x) {

      x.done = e.target.checked;

      render();

      await persist('tasks',x);

    }

  }

});

document.addEventListener('click',async e => {

  if (e.target.dataset.paid) {

    const x = state.expenses.find(
      t => t.id === e.target.dataset.paid
    );

    if (x) {

      x.paid = !x.paid;

      render();

      await persist('expenses',x);

    }

  }

});

const backdrop = $('#modalBackdrop');

function openForm(type) {

  const configs = {

    expense: {

      title: 'Adicionar despesa',

      fields: [

        ['name','Descrição','text','Ex.: Passagem aérea'],

        ['amount','Valor total (R$)','number','0,00'],

        ['category','Categoria','select',[
          'Transporte',
          'Hospedagem',
          'Alimentação',
          'Passeios',
          'Compras',
          'Pessoal',
          'Outros'
        ]],

        ['method','Forma de pagamento','select',[
          'Cartão',
          'Dinheiro',
          'Pix',
          'Dinheiro ou cartão'
        ]],

        ['installments','Parcelas','number','Ex.: 10'],

        ['paid','Já foi pago?','select',[
          'Não',
          'Sim'
        ]]

      ]

    },

    activity: {

      title: 'Adicionar passeio',

      fields: [

        ['name','Nome do passeio','text','Ex.: Parque temático'],

        ['city','Cidade','text','Gramado'],

        ['amount','Valor (R$)','number','0,00'],

        ['method','Forma de pagamento','select',[
          'Cartão',
          'Dinheiro',
          'Pix',
          '—'
        ]],

        ['paid','Já foi pago?','select',[
          'Não',
          'Sim'
        ]]

      ]

    },

    restaurant: {

      title: 'Adicionar restaurante',

      fields: [

        ['name','Nome do restaurante','text','Nome do local'],

        ['city','Cidade','text','Gramado'],

        ['amount','Valor estimado (R$)','number','0,00'],

        ['type','Tipo de refeição','select',[
          'Almoço',
          'Jantar',
          'Lanche',
          'Rodízio',
          'Fondue',
          'Café da manhã'
        ]],

        ['method','Forma de pagamento','select',[
          'Cartão',
          'Dinheiro',
          'Pix',
          '—'
        ]],

        ['paid','Já foi pago?','select',[
          'Não',
          'Sim'
        ]]

      ]

    },

    task: {

      title: 'Adicionar tarefa',

      fields: [

        ['name','Tarefa','text','O que precisa fazer?'],

        ['group','Categoria','select',[
          'Documentos',
          'Organização',
          'Mala',
          'Transporte',
          'Financeiro',
          'Outros'
        ]]

      ]

    },

    trip: {

      title: 'Editar viagem',

      fields: [

        ['name','Nome da viagem','text','Ex.: Férias em Gramado'],

        ['destination','Destino','text','Cidade / região'],

        ['budget','Orçamento previsto (R$)','number','0,00']

      ]

    },

    plan: {

      title: 'Adicionar ao roteiro',

      fields: [

        ['name','Atividade','text','O que você vai fazer?'],

        ['city','Local','text','Endereço ou cidade'],

        ['date','Data','date',''],

        ['time','Horário','time','']

      ]

    }

  };

  const c = configs[type];

  $('#modalTitle').textContent = c.title;

  $('#formFields').innerHTML =
    '<div class="field-grid">' +

    c.fields.map(([key,label,kind,opts]) => `

      <div class="field ${c.fields.length % 2 ? 'full' : ''}">

        <label>${label}</label>

        ${
          kind === 'select'

            ? `<select name="${key}">
                ${opts.map(o => `<option>${o}</option>`).join('')}
               </select>`

            : `<input
                name="${key}"
                type="${kind}"
                placeholder="${opts}"
                ${
                  key === 'amount' ||
                  key === 'budget' ||
                  key === 'installments'
                    ? 'min="0" step="0.01"'
                    : ''
                }
              >`
        }

      </div>

    `).join('') +

    '</div>';

  $('#itemForm').dataset.type = type;

  backdrop.classList.add('open');

}

function closeForm() {

  backdrop.classList.remove('open');

}

$('#closeModal').onclick =
$('#cancelModal').onclick = closeForm;

backdrop.addEventListener('click',e => {

  if (e.target === backdrop) {
    closeForm();
  }

});

$('#itemForm').addEventListener('submit',async e => {

  e.preventDefault();

  const type = e.currentTarget.dataset.type;

  const fd = new FormData(e.currentTarget);

  const v = Object.fromEntries(fd.entries());

  let x;

  if (type === 'trip') {

    state.trip.name = v.name || state.trip.name;

    state.trip.destination = v.destination || '';

    state.trip.budget = Number(v.budget) || 0;

  } else {

    x = {
      id: crypto.randomUUID(),
      ...v
    };

    if ('amount' in x) {
      x.amount = Number(x.amount) || 0;
    }

    if ('installments' in x) {
      x.installments = Number(x.installments) || 0;
    }

    if ('paid' in x) {
      x.paid = v.paid === 'Sim';
    }

    if (type === 'expense') {
      state.expenses.unshift(x);
    }

    if (type === 'activity') {
      state.activities.unshift(x);
    }

    if (type === 'restaurant') {
      state.restaurants.unshift(x);
    }

    if (type === 'task') {
      x.done = false;
      state.tasks.unshift(x);
    }

    if (type === 'plan') {
      toast('Atividade adicionada ao roteiro (organização diária em evolução).');
    }

  }

  render();

  closeForm();

  await persist(

    type === 'trip'
      ? 'trip'
      : type === 'task'
      ? 'tasks'
      : type === 'plan'
      ? 'itineraries'
      : type === 'activity'
      ? 'activities'
      : type === 'restaurant'
      ? 'restaurants'
      : 'expenses',

    type === 'trip' ? state.trip : x

  );

  toast('Informação salva!');

});

$('#shareBtn').onclick = () => {

  const msg =
    `Estou organizando nossa viagem pelo Meu Planejador de Viagens: ${state.trip.name}. Em breve você poderá participar pelo convite do sistema.`;

  if (navigator.share) {

    navigator.share({
      title: 'Compartilhar viagem',
      text: msg
    }).catch(() => {});

  } else if (navigator.clipboard) {

    navigator.clipboard.writeText(msg).then(() =>
      toast('Resumo copiado. Convites por usuário serão habilitados com Firebase.')
    );

  } else {

    toast('Compartilhamento por convite será habilitado após conectar o Firebase.');

  }

};

$('#tripSwitcher').onclick = () =>
  toast('A seleção de múltiplas viagens será habilitada na próxima etapa.');

async function persist(collectionName,item) {

  if (!firebaseReady || !user) return;

  try {

    await addDoc(
      collection(db,collectionName),
      {
        ...item,
        tripId: state.trip.id,
        ownerId: user.uid,
        updatedAt: serverTimestamp()
      }
    );

  } catch(err) {

    console.error(err);

    toast('Não foi possível sincronizar. Seus dados locais continuam disponíveis.');

  }

}

function setupFirebase() {

  if (
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey === 'SUA_API_KEY'
  ) return;

  try {

    const app = initializeApp(firebaseConfig);

    auth = getAuth(app);

    db = getFirestore(app);

    onAuthStateChanged(auth,u => {

      user = u;

      if (u) {

        firebaseReady = true;

        $('#syncStatus').innerHTML =
          '<i style="background:#65a875"></i> Firebase conectado';

        subscribeData();

      } else {

        $('#syncStatus').innerHTML =
          '<i></i> Aguardando login';

      }

    });

  } catch(e) {

    console.warn('Firebase não configurado:',e);

  }

}

function subscribeData() {

  // Próxima etapa:
  // leitura por tripId + controle de membros e permissões.

  console.info(
    'Firebase autenticado. A camada de leitura e compartilhamento será ativada na etapa de autenticação.'
  );

}

render();

setupFirebase();
