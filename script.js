document.addEventListener('DOMContentLoaded', function() {
    // Word input functionality
    document.getElementById('addWordBtn').addEventListener('click', function() {
        const container = document.getElementById('wordInputs');
        if (container.children.length < 15) {
            const newInputDiv = document.createElement('div');
            newInputDiv.className = 'word-input-row';
            newInputDiv.innerHTML = `
                <input type="text" class="word-input" placeholder="Word ${container.children.length + 1}">
            `;
            container.appendChild(newInputDiv);
        } else {
            alert('Maximum 15 words reached!');
        }
    });

    // Form submission
    document.getElementById('wordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const spellingWords = Array.from(document.querySelectorAll('.word-input'))
            .map(input => input.value.trim())
            .filter(word => word.length > 0);

        const definitionsDiv = document.getElementById('definitions');
        definitionsDiv.innerHTML = '<h2>Definitions:</h2>';
        
        for (const word of spellingWords) {
            try {
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                const data = await response.json();
                
                const definitions = [];
                const meanings = data[0]?.meanings || [];
                
                for (let i = 0; i < Math.min(3, meanings.length); i++) {
                    const definition = meanings[i].definitions[0]?.definition;
                    if (definition) {
                        definitions.push(`
                            <li>${simplifyDefinition(definition)}</li>
                        `);
                    }
                }
                
                definitionsDiv.innerHTML += `
                    <div class="word-definition">
                        <h3>${word}</h3>
                        ${definitions.length > 0 ? 
                            `<ol class="definitions-list">${definitions.join('')}</ol>` : 
                            `<p>No simple definitions found</p>`}
                    </div>
                `;
                
            } catch (error) {
                definitionsDiv.innerHTML += `
                    <div class="word-definition">
                        <h3>${word}</h3>
                        <p>Could not load definitions</p>
                    </div>
                `;
            }
        }
        
        localStorage.setItem('spellingWords', JSON.stringify(spellingWords));
    });

    function simplifyDefinition(definition) {
        return definition
            .replace(/\(.*?\)/g, '')
            .replace(/"/g, '')
            .split(';')[0]
            .split('.')[0]
            .split(/\s+/).slice(0, 12).join(' ')
            .replace(/,$/, '');
    }
});
