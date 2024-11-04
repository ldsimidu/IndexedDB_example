// Abrindo conexão com o banco de dados
let db;
const request = indexedDB.open("CadastroDB", 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore("usuarios", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("nome", "nome", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });
    objectStore.createIndex("idade", "idade", { unique: false });
};

request.onsuccess = (event) => {
    db = event.target.result;
    listarUsuarios();
};

request.onerror = (event) => {
    console.error("Erro ao abrir o banco de dados", event.target.errorCode);
};

// Função para cadastrar usuário
document.getElementById("cadastroForm").onsubmit = (event) => {
    event.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const idade = document.getElementById("idade").value;

    const transaction = db.transaction(["usuarios"], "readwrite");
    const objectStore = transaction.objectStore("usuarios");
    const request = objectStore.add({ nome, email, idade: parseInt(idade) });

    request.onsuccess = () => {
        listarUsuarios();
        document.getElementById("cadastroForm").reset();
    };

    request.onerror = () => {
        console.error("Erro ao cadastrar usuário");
    };
};

// Função para listar usuários
function listarUsuarios() {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";
    const transaction = db.transaction(["usuarios"], "readonly");
    const objectStore = transaction.objectStore("usuarios");

    objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const li = document.createElement("li");
            li.textContent = `Nome: ${cursor.value.nome}, Email: ${cursor.value.email}, Idade: ${cursor.value.idade}`;
            userList.appendChild(li);
            cursor.continue();
        }
    };
}

// Função para exportar os dados de usuários para um arquivo JSON
function exportarParaJSON() {
    const transaction = db.transaction(["usuarios"], "readonly");
    const objectStore = transaction.objectStore("usuarios");
    const data = [];

    objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            data.push(cursor.value);
            cursor.continue();
        } else {
            // Quando terminar de buscar, converter e fazer download do JSON
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "usuarios.json";
            a.click();
            URL.revokeObjectURL(url);
        }
    };
}

// Adicionando um botão para chamar a exportação
const exportButton = document.createElement("button");
exportButton.textContent = "Exportar Dados para JSON";
exportButton.onclick = exportarParaJSON;
document.body.appendChild(exportButton);

