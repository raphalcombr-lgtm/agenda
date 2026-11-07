
const CHAVE_USUARIOS = "minhaAgenda1_usuarios";

const formulario = document.querySelector(".auth-form");

function obterUsuarios() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || "[]");
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function mostrarMensagem(texto, sucesso = false) {
  let mensagem = document.getElementById("cadastroMensagem");

  if (!mensagem) {
    mensagem = document.createElement("p");
    mensagem.id = "cadastroMensagem";
    mensagem.setAttribute("role", "status");
    mensagem.style.marginTop = "14px";
    mensagem.style.fontSize = "14px";
    formulario.insertAdjacentElement("afterend", mensagem);
  }

  mensagem.textContent = texto;
  mensagem.style.color = sucesso ? "#16803c" : "#c62828";
}

if (formulario) {
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;

    if (!nome || !email || !senha || !confirmarSenha) {
      mostrarMensagem("Preencha todos os campos.");
      return;
    }

    if (senha.length < 8) {
      mostrarMensagem("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      mostrarMensagem("As senhas não coincidem.");
      return;
    }

    const usuarios = obterUsuarios();

    if (usuarios.some(usuario => usuario.email === email)) {
      mostrarMensagem("Este e-mail já está cadastrado. Entre na sua conta.");
      return;
    }

    // Apenas para testes locais. Não use este armazenamento em produção.
    usuarios.push({
      nome,
      email,
      senha
    });

    try {
      localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
      mostrarMensagem("Conta criada! Redirecionando para o login...", true);

      formulario.reset();

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch {
      mostrarMensagem("Não foi possível salvar a conta neste navegador.");
    }
  });
}
