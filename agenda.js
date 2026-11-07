
const CHAVE_SESSAO = "minhaAgenda2_sessao";
const CHAVE_USUARIOS = "minhaAgenda2_usuarios";
const PREFIXO = "minhaAgendaDashboard";

// ==========================================
// ARMAZENAMENTO
// ==========================================

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch (error) {
    console.error(`Erro ao ler ${key}:`, error);
    return fallback;
  }
}

function salvarJSON(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.error(`Erro ao salvar ${chave}:`, error);
    return false;
  }
}

function obterSessao() {
  for (const armazenamento of [sessionStorage, localStorage]) {
    try {
      const dados = JSON.parse(
        armazenamento.getItem(CHAVE_SESSAO) || "null"
      );

      if (dados?.nome && dados?.email) {
        return dados;
      }
    } catch (error) {
      console.error("Erro ao recuperar sessão:", error);
    }
  }

  return null;
}

// ==========================================
// IDENTIFICAÇÃO DO USUÁRIO
// ==========================================

const sessao = obterSessao();

if (!sessao) {
  window.location.replace("login.html");
} else {
  const nomeCompleto = String(sessao.nome).trim();
  const primeiroNome = nomeCompleto.split(/\s+/)[0];
  const emailUsuario = String(sessao.email).trim().toLowerCase();

  const identificadorUsuario = encodeURIComponent(emailUsuario);
  const storagePrefix = `${PREFIXO}_${identificadorUsuario}`;

  const chaveTarefas = `${storagePrefix}_tasks`;
  const chaveNotas = `${storagePrefix}_notes`;
  const chaveTema = `${storagePrefix}_theme`;
  const chaveNotificacoes = `${storagePrefix}_notifications`;
  const chaveNotificacoesEnviadas =
    `${storagePrefix}_notifications_sent`;
  const chaveWhatsApp = `${storagePrefix}_whatsapp`;

  // ==========================================
  // CORREÇÃO DE DADOS ANTIGOS
  // ==========================================

  function corrigirDadosCompartilhados() {
    const usuarios = readStorage(CHAVE_USUARIOS, []);

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return;
    }

    const emailPrimeiroUsuario = String(
      usuarios[0]?.email || ""
    ).trim().toLowerCase();

    if (
      !emailPrimeiroUsuario ||
      emailUsuario === emailPrimeiroUsuario
    ) {
      return;
    }

    const pares = [
      [chaveTarefas, `${PREFIXO}_tasks`],
      [chaveNotas, `${PREFIXO}_notes`],
      [chaveTema, `${PREFIXO}_theme`],
      [chaveWhatsApp, `${PREFIXO}_whatsapp`]
    ];

    for (const [chaveIndividual, chaveAntiga] of pares) {
      const individual = localStorage.getItem(chaveIndividual);
      const antigo = localStorage.getItem(chaveAntiga);

      if (
        individual !== null &&
        antigo !== null &&
        individual === antigo
      ) {
        localStorage.removeItem(chaveIndividual);
      }
    }
  }

  corrigirDadosCompartilhados();

  // ==========================================
  // ELEMENTOS HTML
  // ==========================================

  const taskForm = document.querySelector("#taskForm");
  const taskInput = document.querySelector("#taskInput");
  const taskDate = document.querySelector("#taskDate");
  const taskTime = document.querySelector("#taskTime");
  const taskPriority = document.querySelector("#taskPriority");
  const taskList = document.querySelector("#taskList");
  const taskEmpty = document.querySelector("#taskEmpty");
  const taskFilter = document.querySelector("#taskFilter");

  const notesInput = document.querySelector("#notesInput");
  const notesStatus = document.querySelector("#notesStatus");
  const saveNotesButton = document.querySelector("#saveNotes");

  const settingsName = document.querySelector("#settingsName");
  const settingsEmail = document.querySelector("#settingsEmail");
  const settingsTheme = document.querySelector("#settingsTheme");

  const settingsNotifications = document.querySelector(
    "#settingsNotifications"
  );

  const notificationStatus = document.querySelector(
    "#notificationStatus"
  );

  const settingsLogout = document.querySelector("#settingsLogout");

  const whatsappNumber = document.querySelector("#whatsappNumber");
  const saveWhatsApp = document.querySelector("#saveWhatsApp");
  const whatsappStatus = document.querySelector("#whatsappStatus");

  const themeButton = document.querySelector("#themeToggle");

  // Elementos do calendário.

  const calendarPage = document.querySelector("#pagina-calendario");
  const calendarMonth = document.querySelector("#calendarMonth");
  const calendarYear = document.querySelector("#calendarYear");
  const calendarDays = document.querySelector("#calendarDays");

  const calendarTaskList = document.querySelector(
    "#calendarTaskList"
  );

  const calendarTaskEmpty = document.querySelector(
    "#calendarTaskEmpty"
  );

  const selectedDateTitle = document.querySelector(
    "#selectedDateTitle"
  );

  const selectedDateDescription = document.querySelector(
    "#selectedDateDescription"
  );

  const previousMonth = document.querySelector("#previousMonth");
  const nextMonth = document.querySelector("#nextMonth");
  const todayButton = document.querySelector("#todayButton");

  const addTaskFromCalendar = document.querySelector(
    "#addTaskFromCalendar"
  );

  // ==========================================
  // FUNÇÕES DE DATA
  // ==========================================

  function formatarDataLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  function converterDataLocal(valor) {
    const [ano, mes, dia] = valor.split("-").map(Number);

    return new Date(ano, mes - 1, dia);
  }

  function formatarDataBonita(valor) {
    if (!valor) return "Data não definida";

    return converterDataLocal(valor).toLocaleDateString(
      "pt-BR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );
  }

  const dataHoje = formatarDataLocal(new Date());

  if (taskDate) {
    taskDate.value = dataHoje;
  }

  // ==========================================
  // WHATSAPP
  // ==========================================

  function normalizarNumeroWhatsApp(valor) {
    let numero = String(valor || "").replace(/\D/g, "");

    if (numero.length === 10 || numero.length === 11) {
      numero = "55" + numero;
    }

    if (
      numero.startsWith("55") &&
      (numero.length === 12 || numero.length === 13)
    ) {
      return numero;
    }

    return null;
  }

  let numeroWhatsApp = "";

  function carregarWhatsApp() {
    const salvo = readStorage(chaveWhatsApp, "");

    numeroWhatsApp = typeof salvo === "string" ? salvo : "";

    if (whatsappNumber) {
      whatsappNumber.value = numeroWhatsApp;
    }

    if (whatsappStatus) {
      whatsappStatus.textContent = numeroWhatsApp
        ? "Número configurado: " + numeroWhatsApp
        : "Nenhum número configurado.";
    }
  }

  function salvarNumeroWhatsApp() {
    if (!whatsappNumber || !whatsappStatus) return;

    const numero = normalizarNumeroWhatsApp(
      whatsappNumber.value
    );

    if (!numero) {
      whatsappStatus.textContent =
        "Número inválido. Informe o DDD e o telefone.";

      whatsappNumber.focus();
      return;
    }

    if (!salvarJSON(chaveWhatsApp, numero)) {
      whatsappStatus.textContent =
        "Não foi possível salvar. Verifique o navegador.";

      return;
    }

    numeroWhatsApp = numero;
    whatsappNumber.value = numero;

    whatsappStatus.textContent =
      "Número salvo com sucesso nesta conta!";
  }

  if (saveWhatsApp) {
    saveWhatsApp.addEventListener(
      "click",
      salvarNumeroWhatsApp
    );
  }

  carregarWhatsApp();

  function prepararMensagemWhatsApp(tarefa) {
    const numeroSalvo = normalizarNumeroWhatsApp(
      readStorage(chaveWhatsApp, "")
    );

    if (!numeroSalvo) {
      alert(
        "Você ainda não configurou um número válido de WhatsApp. Acesse Configurações."
      );
      return;
    }

    const mensagem =
      `Fala, fi! Bem-vindo ao teste de agenda. ` +
      `Sua notificação será enviada às:\n\n` +
      `${tarefa.time || "Horário não definido"}` +
      `\n\nNão se esqueça da sua tarefa!`;

    const url =
      `https://wa.me/${numeroSalvo}?text=${encodeURIComponent(mensagem)}`;

    const janela = window.open(url, "_blank");

    if (!janela) {
      alert(
        "O navegador bloqueou a abertura do WhatsApp. Permita pop-ups para este site."
      );
    }
  }

  // ==========================================
  // TAREFAS
  // ==========================================

  let tasks = readStorage(chaveTarefas, []);

  if (!Array.isArray(tasks)) {
    tasks = [];
  }

  // Mantém as tarefas antigas sem inventar datas.

  tasks = tasks.map(task => ({
    id: task.id || `${Date.now()}-${Math.random()}`,
    title: String(task.title || ""),
    time: task.time || "",
    priority: task.priority || "normal",
    completed: Boolean(task.completed),
    date: task.date || ""
  }));

  function saveTasks() {
    if (!salvarJSON(chaveTarefas, tasks)) {
      alert("Não foi possível salvar as tarefas.");
      return false;
    }

    return true;
  }

  // ==========================================
  // CALENDÁRIO
  // ==========================================

  let dataSelecionada = dataHoje;

  let mesExibido = converterDataLocal(dataHoje);

  mesExibido.setDate(1);

  function renderCalendar() {
    if (
      !calendarDays ||
      !calendarMonth ||
      !calendarYear
    ) {
      return;
    }

    const ano = mesExibido.getFullYear();
    const mes = mesExibido.getMonth();

    calendarMonth.textContent = mesExibido.toLocaleDateString(
      "pt-BR",
      { month: "long" }
    );

    calendarYear.textContent = ano;

    calendarDays.replaceChildren();

    const primeiroDia = new Date(ano, mes, 1);
    const inicioSemana = primeiroDia.getDay();

    const quantidadeDias = new Date(
      ano,
      mes + 1,
      0
    ).getDate();

    const totalCelulas = Math.ceil(
      (inicioSemana + quantidadeDias) / 7
    ) * 7;

    for (let i = 0; i < totalCelulas; i++) {
      const numeroDia = i - inicioSemana + 1;

      const diaValido =
        numeroDia >= 1 &&
        numeroDia <= quantidadeDias;

      const botao = document.createElement("button");

      botao.type = "button";
      botao.className = "calendar-day";

      if (!diaValido) {
        botao.classList.add("outside-month");
        botao.disabled = true;
        botao.tabIndex = -1;

        calendarDays.append(botao);
        continue;
      }

      const dataDia = formatarDataLocal(
        new Date(ano, mes, numeroDia)
      );

      const temTarefa = tasks.some(
        task => task.date === dataDia
      );

      botao.textContent = numeroDia;

      if (dataDia === dataHoje) {
        botao.classList.add("is-today");
      }

      if (dataDia === dataSelecionada) {
        botao.classList.add("is-selected");
      }

      botao.setAttribute(
        "aria-label",
        `${numeroDia} de ${calendarMonth.textContent} de ${ano}`
      );

      if (temTarefa) {
        const indicador = document.createElement("span");

        indicador.className = "calendar-day-indicator";

        botao.append(indicador);
      }

      botao.addEventListener("click", () => {
        dataSelecionada = dataDia;

        renderCalendar();
        renderCalendarTasks();
      });

      calendarDays.append(botao);
    }

    renderCalendarTasks();
  }

  function renderCalendarTasks() {
    if (
      !calendarTaskList ||
      !calendarTaskEmpty
    ) {
      return;
    }

    calendarTaskList.replaceChildren();

    const tarefasDoDia = tasks.filter(
      task => task.date === dataSelecionada
    );

    if (selectedDateTitle) {
      selectedDateTitle.textContent = "Tarefas do dia";
    }

    if (selectedDateDescription) {
      selectedDateDescription.textContent =
        formatarDataBonita(dataSelecionada);
    }

    calendarTaskEmpty.hidden =
      tarefasDoDia.length > 0;

    tarefasDoDia.forEach(task => {
      const item = document.createElement("div");

      item.className =
        `calendar-task-item${task.completed ? " is-completed" : ""}`;

      const checkbox = document.createElement("input");

      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute(
        "aria-label",
        `Concluir ${task.title}`
      );

      checkbox.addEventListener("change", () => {
        const estadoAnterior = task.completed;

        task.completed = checkbox.checked;

        if (!saveTasks()) {
          task.completed = estadoAnterior;
        }

        renderTasks();
        updateStats();
        renderCalendar();
      });

      const details = document.createElement("div");

      details.className = "calendar-task-details";

      const title = document.createElement("strong");

      title.textContent = task.title;

      const meta = document.createElement("small");

      meta.textContent = task.time
        ? `Horário: ${task.time}`
        : "Sem horário definido";

      const priority = document.createElement("small");

      const priorityNames = {
        high: "Prioridade alta",
        normal: "Prioridade normal",
        low: "Prioridade baixa"
      };

      priority.textContent =
        priorityNames[task.priority] || "Prioridade normal";

      details.append(title, meta, priority);

      const deleteButton = document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className = "delete-task";
      deleteButton.textContent = "×";
      deleteButton.setAttribute(
        "aria-label",
        `Excluir ${task.title}`
      );

      deleteButton.addEventListener("click", () => {
        const tarefasAnteriores = [...tasks];

        tasks = tasks.filter(
          currentTask => currentTask.id !== task.id
        );

        if (!saveTasks()) {
          tasks = tarefasAnteriores;
        }

        renderTasks();
        updateStats();
        renderCalendar();
      });

      item.append(
        checkbox,
        details,
        deleteButton
      );

      calendarTaskList.append(item);
    });
  }

  function mudarMes(direcao) {
    const dataAtual = converterDataLocal(dataSelecionada);

    const novaData = new Date(
      mesExibido.getFullYear(),
      mesExibido.getMonth() + direcao,
      1
    );

    mesExibido = novaData;

    dataSelecionada = formatarDataLocal(
      new Date(
        novaData.getFullYear(),
        novaData.getMonth(),
        Math.min(
          dataAtual.getDate(),
          new Date(
            novaData.getFullYear(),
            novaData.getMonth() + 1,
            0
          ).getDate()
        )
      )
    );

    renderCalendar();
  }

  if (previousMonth) {
    previousMonth.addEventListener("click", () => {
      mudarMes(-1);
    });
  }

  if (nextMonth) {
    nextMonth.addEventListener("click", () => {
      mudarMes(1);
    });
  }

  if (todayButton) {
    todayButton.addEventListener("click", () => {
      dataSelecionada = formatarDataLocal(new Date());

      mesExibido = converterDataLocal(dataSelecionada);
      mesExibido.setDate(1);

      renderCalendar();
    });
  }

  if (addTaskFromCalendar) {
    addTaskFromCalendar.addEventListener("click", () => {
      if (taskDate) {
        taskDate.value = dataSelecionada;
      }

      showPage("inicio");

      document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
      });

      document.querySelector(
        '.nav-item[href="#tarefas"]'
      )?.classList.add("active");

      closeSidebar();

      document.querySelector("#tarefas")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      taskInput?.focus({ preventScroll: true });
    });
  }

  // ==========================================
  // RENDERIZAÇÃO DAS TAREFAS
  // ==========================================

  function renderTasks() {
    if (!taskList || !taskFilter || !taskEmpty) return;

    taskList.replaceChildren();

    const filtro = taskFilter.value;

    const tarefasFiltradas = tasks.filter(task => {
      if (filtro === "pending") return !task.completed;
      if (filtro === "completed") return task.completed;

      return true;
    });

    taskEmpty.hidden = tarefasFiltradas.length > 0;

    if (tarefasFiltradas.length === 0) {
      taskEmpty.textContent = tasks.length === 0
        ? "Nenhuma tarefa por aqui. Adicione sua primeira tarefa."
        : "Nenhuma tarefa corresponde a este filtro.";
    }

    tarefasFiltradas.forEach(task => {
      const item = document.createElement("div");

      item.className =
        `task-item${task.completed ? " is-completed" : ""}`;

      const checkbox = document.createElement("input");

      checkbox.type = "checkbox";
      checkbox.className = "task-check";
      checkbox.checked = task.completed;

      checkbox.setAttribute(
        "aria-label",
        `Concluir ${task.title}`
      );

      checkbox.addEventListener("change", () => {
        const estadoAnterior = task.completed;

        task.completed = checkbox.checked;

        if (!saveTasks()) {
          task.completed = estadoAnterior;
        }

        renderTasks();
        updateStats();
        renderCalendar();
      });

      const details = document.createElement("div");

      details.className = "task-details";

      const title = document.createElement("p");

      title.className = "task-title";
      title.textContent = task.title;

      const meta = document.createElement("div");

      meta.className = "task-meta";

      if (task.date) {
        const date = document.createElement("span");

        date.textContent =
          `Data: ${converterDataLocal(task.date).toLocaleDateString("pt-BR")}`;

        meta.append(date);
      }

      if (task.time) {
        const time = document.createElement("span");

        time.textContent = `Horário: ${task.time}`;

        meta.append(time);
      }

      const priority = document.createElement("span");

      priority.className =
        `priority priority-${task.priority}`;

      const priorityNames = {
        high: "Prioridade alta",
        normal: "Prioridade normal",
        low: "Prioridade baixa"
      };

      priority.textContent =
        priorityNames[task.priority] || "Prioridade normal";

      meta.append(priority);
      details.append(title, meta);

      const whatsappButton = document.createElement("button");

      whatsappButton.type = "button";
      whatsappButton.className = "secondary-button";
      whatsappButton.textContent = "WhatsApp";

      whatsappButton.setAttribute(
        "aria-label",
        `Preparar lembrete de ${task.title} pelo WhatsApp`
      );

      whatsappButton.addEventListener("click", () => {
        prepararMensagemWhatsApp(task);
      });

      const deleteButton = document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className = "delete-task";
      deleteButton.textContent = "×";

      deleteButton.setAttribute(
        "aria-label",
        `Excluir ${task.title}`
      );

      deleteButton.addEventListener("click", () => {
        const tarefasAnteriores = [...tasks];

        tasks = tasks.filter(
          currentTask => currentTask.id !== task.id
        );

        if (!saveTasks()) {
          tasks = tarefasAnteriores;
        }

        renderTasks();
        updateStats();
        renderCalendar();
      });

      item.append(
        checkbox,
        details,
        whatsappButton,
        deleteButton
      );

      taskList.append(item);
    });
  }

  // ==========================================
  // ESTATÍSTICAS
  // ==========================================

  function updateStats() {
    const total = tasks.length;

    const completed = tasks.filter(
      task => task.completed
    ).length;

    const pending = total - completed;

    const progress = total === 0
      ? 0
      : Math.round((completed / total) * 100);

    const valores = {
      "#totalTasks": total,
      "#completedTasks": completed,
      "#pendingTasks": pending,
      "#progressNumber": `${progress}%`,
      "#circleNumber": `${progress}%`,
      "#legendTotal": total,
      "#legendCompleted": completed,
      "#legendPending": pending
    };

    for (const [seletor, valor] of Object.entries(valores)) {
      const elemento = document.querySelector(seletor);

      if (elemento) {
        elemento.textContent = valor;
      }
    }

    const circulo = document.querySelector("#progressCircle");

    if (circulo) {
      circulo.style.background =
        `conic-gradient(var(--accent) ${progress}%, var(--border) ${progress}%)`;
    }

    const caption = document.querySelector("#progressCaption");

    if (caption) {
      if (total === 0) {
        caption.textContent =
          "Adicione tarefas para acompanhar seu progresso.";
      } else if (progress === 100) {
        caption.textContent =
          "Todas as tarefas foram concluídas.";
      } else {
        caption.textContent =
          `Você concluiu ${completed} de ${total} tarefas.`;
      }
    }
  }

  // ==========================================
  // ADICIONAR TAREFAS
  // ==========================================

  if (
    taskForm &&
    taskInput &&
    taskTime &&
    taskPriority
  ) {
    taskForm.addEventListener("submit", event => {
      event.preventDefault();

      const title = taskInput.value.trim();

      if (!title) {
        taskInput.focus();
        return;
      }

      const dataTarefa =
        taskDate?.value || formatarDataLocal(new Date());

      const tarefa = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        time: taskTime.value,
        priority: taskPriority.value,
        completed: false,
        date: dataTarefa
      };

      tasks.unshift(tarefa);

      if (!saveTasks()) {
        tasks.shift();
        return;
      }

      taskInput.value = "";
      taskTime.value = "";
      taskPriority.value = "normal";

      if (taskDate) {
        taskDate.value = formatarDataLocal(new Date());
      }

      if (taskFilter) {
        taskFilter.value = "all";
      }

      renderTasks();
      updateStats();
      renderCalendar();

      taskInput.focus();
    });
  }

  if (taskFilter) {
    taskFilter.addEventListener("change", renderTasks);
  }

  const newTaskButton = document.querySelector("#newTaskTop");

  if (newTaskButton) {
    newTaskButton.addEventListener("click", () => {
      document.querySelector("#tarefas")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      taskInput?.focus({ preventScroll: true });
    });
  }

  // ==========================================
  // NOTAS RÁPIDAS
  // ==========================================

  function loadNotes() {
    if (!notesInput) return;

    const savedNotes = readStorage(chaveNotas, "");

    notesInput.value =
      typeof savedNotes === "string" ? savedNotes : "";
  }

  function saveNotes() {
    if (!notesInput || !notesStatus) return;

    if (salvarJSON(chaveNotas, notesInput.value)) {
      notesStatus.textContent =
        "Notas salvas neste navegador.";
    } else {
      notesStatus.textContent =
        "Não foi possível salvar as notas.";
    }
  }

  if (saveNotesButton) {
    saveNotesButton.addEventListener("click", saveNotes);
  }

  // ==========================================
  // TEMA CLARO E ESCURO
  // ==========================================

  function applyTheme(theme) {
    const dark = theme === "dark";

    document.body.classList.toggle("dark-theme", dark);

    if (themeButton) {
      themeButton.textContent = dark ? "☀" : "☾";
    }

    if (settingsTheme) {
      settingsTheme.checked = dark;
    }
  }

  function changeTheme(theme) {
    applyTheme(theme);

    if (!salvarJSON(chaveTema, theme)) {
      console.error("Não foi possível salvar o tema.");
    }
  }

  const savedTheme = readStorage(chaveTema, "light");

  applyTheme(savedTheme === "dark" ? "dark" : "light");

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const nextTheme =
        document.body.classList.contains("dark-theme")
          ? "light"
          : "dark";

      changeTheme(nextTheme);
    });
  }

  if (settingsTheme) {
    settingsTheme.addEventListener("change", () => {
      changeTheme(settingsTheme.checked ? "dark" : "light");
    });
  }

  // ==========================================
  // INFORMAÇÕES DA CONTA
  // ==========================================

  if (settingsName) {
    settingsName.textContent = nomeCompleto;
  }

  if (settingsEmail) {
    settingsEmail.textContent = emailUsuario;
  }

  // ==========================================
  // NOTIFICAÇÕES DO NAVEGADOR
  // ==========================================

  let notificacoesAtivas = readStorage(
    chaveNotificacoes,
    false
  );

  let temporizadorNotificacoes = null;

  function atualizarStatusNotificacao(mensagem) {
    if (notificationStatus) {
      notificationStatus.textContent = mensagem;
    }
  }

  function verificarNotificacoes() {
    if (!notificacoesAtivas) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const agora = new Date();
    const horarioAtual = agora.toTimeString().slice(0, 5);
    const dataAtual = formatarDataLocal(agora);

    let enviadas = readStorage(
      chaveNotificacoesEnviadas,
      {}
    );

    if (
      !enviadas ||
      typeof enviadas !== "object" ||
      Array.isArray(enviadas)
    ) {
      enviadas = {};
    }

    tasks.forEach(tarefa => {
      if (!tarefa.time || tarefa.completed) return;

      if (tarefa.date && tarefa.date !== dataAtual) {
        return;
      }

      if (tarefa.time !== horarioAtual) return;

      const identificador = `${dataAtual}_${tarefa.id}`;

      if (enviadas[identificador]) return;

      try {
        const aviso = new Notification("Minha Agenda", {
          body: `Está na hora de: ${tarefa.title}`,
          tag: identificador
        });

        aviso.onclick = () => {
          window.focus();
          aviso.close();
        };

        enviadas[identificador] = true;

        salvarJSON(chaveNotificacoesEnviadas, enviadas);
      } catch (error) {
        console.error("Erro na notificação:", error);
      }
    });
  }

  function iniciarNotificacoes() {
    if (temporizadorNotificacoes) return;

    verificarNotificacoes();

    temporizadorNotificacoes = setInterval(
      verificarNotificacoes,
      15000
    );
  }

  function pararNotificacoes() {
    if (temporizadorNotificacoes) {
      clearInterval(temporizadorNotificacoes);
      temporizadorNotificacoes = null;
    }
  }

  async function ativarNotificacoes() {
    if (!("Notification" in window)) {
      atualizarStatusNotificacao(
        "Seu navegador não oferece suporte a notificações."
      );

      return false;
    }

    let permissao = Notification.permission;

    if (permissao === "default") {
      permissao = await Notification.requestPermission();
    }

    if (permissao !== "granted") {
      atualizarStatusNotificacao(
        "Permissão não concedida. Verifique as configurações do navegador."
      );

      return false;
    }

    notificacoesAtivas = true;

    if (!salvarJSON(chaveNotificacoes, true)) {
      notificacoesAtivas = false;

      atualizarStatusNotificacao(
        "Não foi possível salvar sua preferência."
      );

      return false;
    }

    iniciarNotificacoes();

    atualizarStatusNotificacao(
      "Notificações ativadas! Aguardando os horários das tarefas."
    );

    return true;
  }

  if (settingsNotifications) {
    settingsNotifications.checked = Boolean(notificacoesAtivas);

    settingsNotifications.addEventListener(
      "change",
      async () => {
        if (settingsNotifications.checked) {
          const ativadas = await ativarNotificacoes();

          if (!ativadas) {
            settingsNotifications.checked = false;
            notificacoesAtivas = false;

            salvarJSON(chaveNotificacoes, false);
          }
        } else {
          notificacoesAtivas = false;

          salvarJSON(chaveNotificacoes, false);
          pararNotificacoes();

          atualizarStatusNotificacao(
            "Notificações desativadas."
          );
        }
      }
    );
  }

  if (notificacoesAtivas) {
    if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      iniciarNotificacoes();

      atualizarStatusNotificacao(
        "Notificações ativadas. Aguardando os horários das tarefas."
      );
    } else {
      atualizarStatusNotificacao(
        "Permita notificações novamente nas configurações do navegador."
      );
    }
  } else {
    atualizarStatusNotificacao("Notificações desativadas.");
  }

  // ==========================================
  // SAIR PELAS CONFIGURAÇÕES
  // ==========================================

  // ==========================================
  // SAIR PELAS CONFIGURAÇÕES
  // ==========================================

  if (settingsLogout) {
    settingsLogout.addEventListener("click", async () => {
      pararNotificacoes();

      try {
        const { error } = await window.supabaseClient.auth.signOut();

        if (error) {
          console.error("Erro ao sair:", error);
          alert("Não foi possível encerrar a sessão.");
          return;
        }

        sessionStorage.removeItem(CHAVE_SESSAO);
        localStorage.removeItem(CHAVE_SESSAO);

        window.location.replace("login.html");

      } catch (erro) {
        console.error("Erro inesperado ao sair:", erro);
        alert("Ocorreu um erro ao encerrar a sessão.");
      }
    });
  }


  // ==========================================
  // NAVEGAÇÃO E MENU LATERAL
  // ==========================================

  const sidebar = document.querySelector("#sidebar");
  const overlay = document.querySelector("#sidebarOverlay");
  const menuButton = document.querySelector("#menuToggle");

  const homePage = document.querySelector("#pagina-inicial");

  const settingsPage = document.querySelector(
    "#pagina-configuracoes"
  );

  function closeSidebar() {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("visible");
  }

  function showPage(page) {
    const isSettings = page === "configuracoes";
    const isCalendar = page === "calendario";

    if (homePage) {
      homePage.hidden = isSettings || isCalendar;
    }

    if (settingsPage) {
      settingsPage.hidden = !isSettings;
    }

    if (calendarPage) {
      calendarPage.hidden = !isCalendar;
    }

    if (isCalendar) {
      renderCalendar();
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  if (menuButton) {
    menuButton.addEventListener("click", () => {
      sidebar?.classList.toggle("open");
      overlay?.classList.toggle("visible");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  document.querySelectorAll(".nav-item").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();

      const destino = link.getAttribute("href");

      if (link.dataset.page === "configuracoes") {
        showPage("configuracoes");
      } else if (destino === "#calendario") {
        showPage("calendario");
      } else {
        showPage("inicio");

        if (destino && destino !== "#inicio") {
          const elemento = document.querySelector(destino);

          if (elemento) {
            elemento.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        }
      }

      document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
      });

      link.classList.add("active");

      closeSidebar();
    });
  });

  // ==========================================
  // DATA E BOAS-VINDAS
  // ==========================================

  function getTodayLabel() {
    return new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function setWelcome() {
    const hour = new Date().getHours();

    let greeting = "Boa noite";

    if (hour >= 5 && hour < 12) {
      greeting = "Bom dia";
    } else if (hour >= 12 && hour < 18) {
      greeting = "Boa tarde";
    }

    const titulo = document.querySelector("#welcomeTitle");
    const data = document.querySelector("#todayLabel");

    if (titulo) {
      titulo.textContent = `${greeting}, ${primeiroNome}!`;
    }

    if (data) {
      data.textContent = getTodayLabel();
    }
  }
  // ==========================================
  // PERFIL E FOTO DE PERFIL
  // ==========================================

  const profileAvatar = document.querySelector("#profileAvatar");
  const avatarInitial = document.querySelector("#avatarInitial");
  const profileAvatarImage = document.querySelector("#profileAvatarImage");
  const avatarFileInput = document.querySelector("#avatarFileInput");

  const supabaseClient = window.supabaseClient;

  function mostrarInicialAvatar() {
    if (avatarInitial) {
      avatarInitial.textContent =
        primeiroNome.charAt(0).toUpperCase();
      avatarInitial.hidden = false;
    }

    if (profileAvatarImage) {
      profileAvatarImage.src = "";
      profileAvatarImage.hidden = true;
    }
  }

  async function carregarFotoPerfil() {
    if (!supabaseClient || !profileAvatarImage) return;

    try {
      const { data: usuarioData, error: usuarioError } =
        await supabaseClient.auth.getUser();

      if (usuarioError) throw usuarioError;

      const usuario = usuarioData.user;

      if (!usuario) {
        mostrarInicialAvatar();
        return;
      }

      const extensao =
        usuario.user_metadata?.avatar_extension || "jpg";

      const caminho = `${usuario.id}/avatar.${extensao}`;

      const { data, error } = await supabaseClient.storage
        .from("avatars")
        .createSignedUrl(caminho, 3600);

      if (error) {
        mostrarInicialAvatar();
        return;
      }

      profileAvatarImage.onload = () => {
        profileAvatarImage.hidden = false;

        if (avatarInitial) {
          avatarInitial.hidden = true;
        }
      };

      profileAvatarImage.onerror = mostrarInicialAvatar;
      profileAvatarImage.src = data.signedUrl;

    } catch (erro) {
      console.error("Erro ao carregar foto de perfil:", erro);
      mostrarInicialAvatar();
    }
  }

  async function enviarFotoPerfil(arquivo) {
    if (!arquivo || !supabaseClient) return;

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      alert("Escolha uma imagem JPG, PNG ou WEBP.");
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2 MB.");
      return;
    }

    try {
      const { data: usuarioData, error: usuarioError } =
        await supabaseClient.auth.getUser();

      if (usuarioError) throw usuarioError;

      const usuario = usuarioData.user;

      if (!usuario) {
        throw new Error("Usuário não autenticado.");
      }

      const extensao = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
      }[arquivo.type];

      const caminho = `${usuario.id}/avatar.${extensao}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("avatars")
        .upload(caminho, arquivo, {
          upsert: true,
          contentType: arquivo.type,
          cacheControl: "3600"
        });

      if (uploadError) throw uploadError;

      const { error: metadataError } =
        await supabaseClient.auth.updateUser({
          data: {
            avatar_extension: extensao
          }
        });

      if (metadataError) throw metadataError;

      await carregarFotoPerfil();

      alert("Foto de perfil atualizada com sucesso!");

    } catch (erro) {
      console.error("Erro ao enviar foto:", erro);
      alert("Não foi possível atualizar sua foto. Verifique as permissões do Storage.");
    }
  }

  if (profileAvatar && avatarFileInput) {
    profileAvatar.addEventListener("click", () => {
      avatarFileInput.click();
    });

    profileAvatar.addEventListener("keydown", evento => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        avatarFileInput.click();
      }
    });

    avatarFileInput.addEventListener("change", async () => {
      const arquivo = avatarFileInput.files[0];

      if (arquivo) {
        await enviarFotoPerfil(arquivo);
      }

      avatarFileInput.value = "";
    });
  }

  function loadProfile() {
    const perfil = document.querySelector("#profileName");

    if (perfil) {
      perfil.textContent = nomeCompleto;
    }

    mostrarInicialAvatar();
    carregarFotoPerfil();
  }

  // ==========================================
  // INICIALIZAÇÃO
  // ==========================================

  setWelcome();
  loadProfile();
  loadNotes();

  renderTasks();
  updateStats();
  renderCalendar();
}
