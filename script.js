// --- LÓGICA DE JAVASCRIPT ---

// Referencias a los elementos del DOM
const counterNameInput = document.getElementById('counterName');
const counterColorInput = document.getElementById('counterColor');
const addBtn = document.getElementById('addBtn');
const countersContainer = document.getElementById('countersContainer');

// Estado de la aplicación: Intentamos cargar desde localStorage, si no hay nada, empezamos con array vacío
let counters = JSON.parse(localStorage.getItem('my_counters')) || [];

// Función para guardar el estado actual en el localStorage
function saveToLocalStorage() {
    localStorage.setItem('my_counters', JSON.stringify(counters));
}

// Función encargada de pintar los contadores en pantalla
function renderCounters() {
    countersContainer.innerHTML = ''; // Limpiamos el contenedor

    if (counters.length === 0) {
        countersContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #7f8c8d;">No hay contadores. ¡Añade uno arriba!</p>';
        return;
    }

    counters.forEach((counter, index) => {
        // Contenedor principal del ítem
        const wrapper = document.createElement('div');
        wrapper.className = 'counter-wrapper';

        // Título fuera de la tarjeta (arriba)
        const title = document.createElement('div');
        title.className = 'counter-title';
        title.textContent = counter.name;

        // Tarjeta (el "resto" del contador)
        const card = document.createElement('div');
        card.className = 'counter-card';
        card.style.borderColor = counter.color;

        // Botón de eliminar (X) se mantiene en la tarjeta o podría ir en el wrapper
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Eliminar contador';
        deleteBtn.onclick = () => deleteCounter(index);

        // Valor numérico
        const value = document.createElement('div');
        value.className = 'counter-value';
        value.textContent = counter.value;

        // Contenedor de botones + y -
        const controls = document.createElement('div');
        controls.className = 'counter-controls';
        
        const minusBtn = document.createElement('button');
        minusBtn.className = 'btn-control btn-minus';
        minusBtn.textContent = '-';
        minusBtn.style.backgroundColor = counter.color; // Color dinámico
        minusBtn.onclick = () => updateValue(index, -1);

        const plusBtn = document.createElement('button');
        plusBtn.className = 'btn-control btn-plus';
        plusBtn.textContent = '+';
        plusBtn.style.backgroundColor = counter.color; // Color dinámico
        plusBtn.onclick = () => updateValue(index, 1);

        // Ensamblamos la tarjeta
        controls.appendChild(minusBtn);
        controls.appendChild(plusBtn);
        
        card.appendChild(deleteBtn);
        card.appendChild(value);
        card.appendChild(controls);

        // Ensamblamos el wrapper
        wrapper.appendChild(title);
        wrapper.appendChild(card);

        countersContainer.appendChild(wrapper);
    });
}

// Función para añadir un nuevo contador
function addCounter() {
    const name = counterNameInput.value.trim();
    const color = counterColorInput.value;

    if (name === '') {
        alert('Por favor, escribe un nombre para el contador.');
        return;
    }

    // Creamos el nuevo objeto de tipo contador
    const newCounter = {
        name: name,
        value: 0,
        color: color
    };

    counters.push(newCounter); // Lo sumamos al estado
    saveToLocalStorage();      // Guardamos en la memoria del navegador
    renderCounters();          // Redibujamos la interfaz

    // Limpiamos el input de texto para el próximo
    counterNameInput.value = '';
}

// Función para actualizar el valor (+1 o -1)
function updateValue(index, change) {
    counters[index].value += change;
    saveToLocalStorage();
    renderCounters();
}

// Función para eliminar un contador
function deleteCounter(index) {
    if(confirm(`¿Estás seguro de que quieres borrar "${counters[index].name}"?`)) {
        counters.splice(index, 1); // Lo quitamos del array
        saveToLocalStorage();
        renderCounters();
    }
}

// --- EVENTOS ---
addBtn.addEventListener('click', addCounter);

// Permitir añadir también pulsando la tecla "Enter" en el input
counterNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addCounter();
    }
});

// Renderizado inicial al cargar la página por primera vez
renderCounters();