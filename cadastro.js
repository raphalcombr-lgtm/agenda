
const formulario = document.querySelector(".auth-form");

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
    formulario.addEventListener("submit", async function (evento) {
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

        if (!window.supabaseClient) {
            mostrarMensagem("Erro ao conectar com o sistema. Atualize a página.");
            return;
        }

        const botao = formulario.querySelector('button[type="submit"]');

        botao.disabled = true;
        botao.textContent = "Criando conta...";

        try {
            const { data, error } =
                await window.supabaseClient.auth.signUp({
                    email,
                    password: senha,
                    options: {
                        data: {
                            name: nome
                        },
                        emailRedirectTo: window.location.origin + "/agenda1.html"
                    }
                });

            if (error) {
                console.error("Erro no cadastro:", error);
                mostrarMensagem("Não foi possível criar a conta: " + error.message);
                return;
            }

            if (data.session) {
                mostrarMensagem("Conta criada com sucesso! Redirecionando...", true);

                setTimeout(() => {
                    window.location.href = "agenda1.html";
                }, 1000);
            } else {
                mostrarMensagem(
                    "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.",
                    true
                );

                formulario.reset();
            }

        } catch (erro) {
            console.error("Erro inesperado:", erro);
            mostrarMensagem("Ocorreu um erro ao criar sua conta.");
        } finally {
            botao.disabled = false;
            botao.textContent = "Criar conta";
        }
    });
}
