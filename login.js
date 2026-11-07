
const formulario = document.querySelector(".auth-form");

console.log("LOGIN.JS CARREGADO");

function mostrarMensagem(texto, sucesso = false) {
    let mensagem = document.getElementById("loginMensagem");

    if (!mensagem) {
        mensagem = document.createElement("p");
        mensagem.id = "loginMensagem";
        mensagem.setAttribute("role", "status");
        mensagem.style.marginTop = "14px";
        mensagem.style.fontSize = "14px";

        formulario.insertAdjacentElement("afterend", mensagem);
    }

    mensagem.textContent = texto;
    mensagem.style.color = sucesso ? "#2e7d32" : "#c62828";
}

if (!formulario) {
    console.error("Formulário não encontrado.");
} else {
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const email = document
            .getElementById("email")
            .value.trim()
            .toLowerCase();

        const senha = document.getElementById("senha").value;

        const botao = formulario.querySelector(
            'button[type="submit"]'
        );

        if (!window.supabaseClient) {
            mostrarMensagem("Erro ao conectar com o sistema. Atualize a página.");
            return;
        }

        botao.disabled = true;
        botao.textContent = "Entrando...";

        try {
            const { data, error } =
                await window.supabaseClient.auth.signInWithPassword({
                    email,
                    password: senha
                });

            if (error) {
                console.error("Erro no login:", error);

                if (error.message.toLowerCase().includes("email not confirmed")) {
                    mostrarMensagem("Confirme seu e-mail antes de entrar.");
                } else {
                    mostrarMensagem("E-mail ou senha incorretos.");
                }

                return;
            }

            if (!data.user) {
                mostrarMensagem("Não foi possível identificar sua conta.");
                return;
            }

            console.log("Login realizado com sucesso.");

            window.location.href = "agenda1.html";

        } catch (erro) {
            console.error("Erro inesperado:", erro);
            mostrarMensagem("Ocorreu um erro. Tente novamente.");
        } finally {
            botao.disabled = false;
            botao.innerHTML = 'Entrar na minha conta <span>→</span>';
        }
    });
}
