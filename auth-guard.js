
(async () => {
    const supabaseClient = window.supabaseClient;

    if (!supabaseClient) {
        console.error("Supabase não foi inicializado.");
        window.location.replace("login.html");
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) throw error;

        const sessao = data.session;

        if (!sessao || !sessao.user) {
            window.location.replace("login.html");
            return;
        }

        const usuario = sessao.user;

        const nome =
            usuario.user_metadata?.name ||
            usuario.user_metadata?.nome ||
            usuario.email?.split("@")[0] ||
            "Usuário";

        const email = usuario.email || "";
        const primeiroNome = nome.trim().split(/\s+/)[0];

        // Mantém compatibilidade com o agenda.js antigo.
        sessionStorage.setItem(
            "minhaAgenda2_sessao",
            JSON.stringify({ nome, email })
        );

        const perfil = document.querySelector("#profileName");
        const titulo = document.querySelector("#welcomeTitle");
        const avatarInitial = document.querySelector("#avatarInitial");
        const botaoSair = document.querySelector("#logoutButton");

        if (perfil) {
            perfil.textContent = nome;
        }

       if (avatarInitial) {
    avatarInitial.textContent = primeiroNome.charAt(0).toUpperCase();
}

        if (titulo) {
            const hora = new Date().getHours();

            const saudacao =
                hora < 12 ? "Bom dia" :
                hora < 18 ? "Boa tarde" : "Boa noite";

            titulo.textContent = `${saudacao}, ${primeiroNome}!`;
        }

        if (botaoSair) {
            botaoSair.addEventListener("click", async () => {
                botaoSair.disabled = true;

                const { error } = await supabaseClient.auth.signOut();

                if (error) {
                    console.error("Erro ao sair:", error);
                    botaoSair.disabled = false;
                    alert("Não foi possível encerrar a sessão.");
                    return;
                }

                sessionStorage.removeItem("minhaAgenda2_sessao");
                window.location.replace("login.html");
            });
        }

        // Carrega a agenda somente depois de validar o usuário.
        const script = document.createElement("script");
        script.src = "agenda.js";

        script.onload = () => {
            console.log("Agenda carregada após autenticação.");
        };

        script.onerror = () => {
            console.error("Não foi possível carregar agenda.js.");
        };

        document.body.appendChild(script);

    } catch (erro) {
        console.error("Erro ao verificar autenticação:", erro);
        sessionStorage.removeItem("minhaAgenda2_sessao");
        window.location.replace("login.html");
    }
})();
