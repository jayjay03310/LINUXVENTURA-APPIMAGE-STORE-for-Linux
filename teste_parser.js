// Teste para verificar se o parser de arquivos de fontes funciona corretamente
const fs = require('fs');

// Conteúdo do exemplo de arquivo
const content = fs.readFileSync('./exemplo_fontes_personalizadas.txt', 'utf8');

console.log('Conteúdo original:');
console.log(content);
console.log('\n' + '='.repeat(50) + '\n');

// Remover comentários de linha única e multilinha
// Preservar URLs que contêm "//"
let cleanContent = content
    .replace(/\/\*[\s\S]*?\*\//g, '')  // Remover comentários multilinha /* ... */
    .replace(/(\s+)\/\/.*$/gm, '$1');  // Remover comentários de linha que começam após espaço em branco

console.log('Conteúdo após remoção de comentários:');
console.log(cleanContent);
console.log('\n' + '='.repeat(50) + '\n');

// Tentar parsear como JSON
let appsToAdd;
try {
    appsToAdd = JSON.parse(cleanContent);
    console.log('Parse direto como JSON funcionou!');
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
        
        console.log('Conteúdo após proteção de URLs:');
        console.log(jsonString);
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Substituir as chaves do objeto JavaScript (sem aspas) por chaves JSON (com aspas)
        jsonString = jsonString
            .replace(/(\s*)(\w+)(\s*:)/g, '$1"$2"$3')  // Coloca aspas nas chaves
            .replace(/:\s*'([^']*)'/g, ': "$1"');      // Substitui aspas simples por duplas em valores
        
        console.log('Conteúdo após conversão de chaves:');
        console.log(jsonString);
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Restaurar URLs originais
        placeholders.forEach((originalUrl, index) => {
            jsonString = jsonString.replace(`__URL_PLACEHOLDER_${index}__`, originalUrl);
        });
        
        console.log('Conteúdo após restauração de URLs:');
        console.log(jsonString);
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Remover vírgulas extras antes de ] ou }
        jsonString = jsonString.replace(/,\s*(\s*[}\]])/g, '$2');
        
        console.log('JSON convertido:');
        console.log(jsonString);
        console.log('\n' + '='.repeat(50) + '\n');
        
        appsToAdd = JSON.parse(jsonString);
        console.log('Parse após conversão funcionou!');
    } catch (conversionError) {
        console.error(`Não foi possível converter o arquivo para o formato JSON. Erro: ${conversionError.message}`);
    }
}

console.log('\nResultado final:');
if (appsToAdd) {
    console.log(JSON.stringify(appsToAdd, null, 2));
} else {
    console.log('Falha na conversão');
}