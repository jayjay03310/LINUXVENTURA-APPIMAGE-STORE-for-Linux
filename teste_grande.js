// Teste para verificar se o parser de arquivos de fontes funciona corretamente com o arquivo grande
const fs = require('fs');

// Conteúdo do arquivo grande
const content = fs.readFileSync('./applications_real_appimage.txt', 'utf8');

console.log('Número de caracteres no arquivo:', content.length);

// Remover comentários de linha única e multilinha
// Preservar URLs que contêm "//"
let cleanContent = content
    .replace(/\/\*[\s\S]*?\*\//g, '')  // Remover comentários multilinha /* ... */
    .replace(/(\s+)\/\/.*$/gm, '$1');  // Remover comentários de linha que começam após espaço em branco

// Tentar parsear como JSON
let appsToAdd;
try {
    appsToAdd = JSON.parse(cleanContent);
    console.log('Parse direto como JSON funcionou!');
    console.log('Número de aplicativos encontrados:', appsToAdd.length);
} catch (parseError) {
    console.log('Parse direto como JSON falhou. Convertendo de JS para JSON...');
    
    // Se não for JSON válido, converter a sintaxe JavaScript para JSON
    try {
        // Substituir as chaves do objeto JavaScript (sem aspas) por chaves JSON (com aspas)
        // Mas preservar URLs e outros valores que contenham ":"
        let jsonString = cleanContent;
        
        // Primeiro, proteger URLs e outros valores com ":" substituindo temporariamente
        const placeholders = [];
        jsonString = jsonString.replace(/(https?:\/\/[^\s"'\]}>,]+)/g, (match) => {
            const placeholder = `__URL_PLACEHOLDER_${placeholders.length}__`;
            placeholders.push(match);
            return placeholder;
        });
        
        // Substituir as chaves do objeto JavaScript (sem aspas) por chaves JSON (com aspas)
        jsonString = jsonString
            .replace(/(\s*)(\w+)(\s*:)/g, '$1"$2"$3')  // Coloca aspas nas chaves
            .replace(/:\s*'([^']*)'/g, ': "$1"');      // Substitui aspas simples por duplas em valores
        
        // Restaurar URLs originais
        placeholders.forEach((originalUrl, index) => {
            jsonString = jsonString.replace(`__URL_PLACEHOLDER_${index}__`, originalUrl);
        });
        
        // Remover vírgulas extras antes de ] ou }
        jsonString = jsonString.replace(/,\s*(\s*[}\]])/g, '$2');
        
        appsToAdd = JSON.parse(jsonString);
        console.log('Parse após conversão funcionou!');
        console.log('Número de aplicativos encontrados:', appsToAdd.length);
    } catch (conversionError) {
        console.error(`Não foi possível converter o arquivo para o formato JSON. Erro: ${conversionError.message}`);
    }
}

console.log('\nPrimeiros 3 aplicativos:');
if (appsToAdd) {
    console.log(JSON.stringify(appsToAdd.slice(0, 3), null, 2));
} else {
    console.log('Falha na conversão');
}