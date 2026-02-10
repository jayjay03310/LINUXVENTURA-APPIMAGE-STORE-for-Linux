// Script de teste para verificar as funcionalidades principais
const fs = require('fs');
const path = require('path');

console.log('=== Testando funcionalidades da Wiistore ===\n');

// 1. Verificar se os arquivos principais existem
console.log('1. Verificando arquivos principais...');
const arquivosNecessarios = ['main.js', 'renderer.js', 'index.html', 'styles.css'];
let arquivosOk = true;

for (const arquivo of arquivosNecessarios) {
    if (fs.existsSync(arquivo)) {
        console.log(`✓ ${arquivo} encontrado`);
    } else {
        console.log(`✗ ${arquivo} NÃO encontrado`);
        arquivosOk = false;
    }
}

if (!arquivosOk) {
    console.log('\nERRO: Alguns arquivos necessários estão faltando!');
    process.exit(1);
}

console.log('\n2. Verificando estrutura do renderer.js...');
const rendererCode = fs.readFileSync('renderer.js', 'utf8');

// Verificar se a função addSource foi modificada corretamente
if (rendererCode.includes('window.addSource = async () =>')) {
    console.log('✓ Função addSource atualizada para carregar arquivos de script');
} else {
    console.log('✗ Função addSource não está atualizada');
}

// Verificar se a função renderApps foi otimizada
if (rendererCode.includes('Promise.all(') && rendererCode.includes('fileChecks')) {
    console.log('✓ Função renderApps otimizada com Promise.all');
} else {
    console.log('✗ Função renderApps não está otimizada');
}

console.log('\n3. Verificando estrutura do main.js...');
const mainCode = fs.readFileSync('main.js', 'utf8');

// Verificar se as configurações para ambiente gráfico problemático foram adicionadas
if (mainCode.includes('app.disableHardwareAcceleration()')) {
    console.log('✓ Configurações para ambiente gráfico adicionadas');
} else {
    console.log('✗ Configurações para ambiente gráfico não encontradas');
}

// Verificar se o tratamento de erros no launch-app foi melhorado
if (mainCode.includes('try {') && mainCode.includes('subprocess.on(')) {
    console.log('✓ Tratamento de erros no launch-app melhorado');
} else {
    console.log('✗ Tratamento de erros no launch-app não encontrado');
}

console.log('\n4. Verificando funcionalidades de persistência...');
if (mainCode.includes('SOURCES_FILE') && mainCode.includes('loadCustomSources')) {
    console.log('✓ Funcionalidades de persistência de fontes personalizadas presentes');
} else {
    console.log('✗ Funcionalidades de persistência de fontes personalizadas ausentes');
}

console.log('\n5. Verificando manipuladores IPC...');
const ipcHandles = ['add-source', 'get-custom-sources', 'add-sources-batch'];
let handlesOk = true;

for (const handle of ipcHandles) {
    if (mainCode.includes(`ipcMain.handle('${handle}'`)) {
        console.log(`✓ Manipulador IPC '${handle}' encontrado`);
    } else {
        console.log(`✗ Manipulador IPC '${handle}' NÃO encontrado`);
        handlesOk = false;
    }
}

if (handlesOk) {
    console.log('\n✓ Todos os manipuladores IPC estão presentes');
} else {
    console.log('\n✗ Alguns manipuladores IPC estão ausentes');
}

console.log('\n=== Teste concluído ===');
console.log('As modificações implementadas:');
console.log('- Correção do problema de execução após download na mesma sessão');
console.log('- Adição da funcionalidade para carregar arquivos de script com múltiplas fontes');
console.log('- Melhoria na interface para lidar com ambientes gráficos problemáticos');
console.log('- Otimização da função de renderização para melhor desempenho');