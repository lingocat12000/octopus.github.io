document.addEventListener('DOMContentLoaded', function() {
    // Add Word Button
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

    // Form Submission
    document.getElementById('wordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const spellingWords = Array.from(document.querySelectorAll('.word-input'))
            .map(input => input.value.trim())
            .filter(word => word.length > 0);

        const definitionsDiv = document.getElementById('definitions');
        definitionsDiv.innerHTML = '<h3>Definitions:</h3>';
        
        for (const word of spellingWords) {
            try {
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                const data = await response.json();
                
                // Get up to 3 simple definitions
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
                
                // Display definitions
                definitionsDiv.innerHTML += `
                    <div class="word-card">
                        <h4>${word}</h4>
                        ${definitions.length > 0 ? 
                            `<ol class="definitions-list">${definitions.join('')}</ol>` : 
                            `<p>No simple definitions found</p>`}
                    </div>
                `;
                
            } catch (error) {
                definitionsDiv.innerHTML += `
                    <div class="word-card">
                        <h4>${word}</h4>
                        <p>Could not load definitions</p>
                    </div>
                `;
            }
        }
        
        localStorage.setItem('spellingWords', JSON.stringify(spellingWords));
    });

    // Simplify definitions for kids
    function simplifyDefinition(definition) {
        return definition
            .replace(/\(.*?\)/g, '')  // Remove parentheses content
            .replace(/"/g, '')         // Remove quotes
            .split(';')[0]             // Take first clause
            .split('.')[0]             // Take first sentence
            .split(/\s+/).slice(0, 12).join(' ')  // Limit to 12 words
            .replace(/,$/, '');        // Remove trailing commas
    }
});
