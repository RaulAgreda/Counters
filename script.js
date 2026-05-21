// --- TRADUCCIONES ---
const translations = {
    es: {
        title: "Mis Contadores",
        sidebarTitle: "Etiquetas",
        addTag: "Añadir etiqueta",
        allTags: "Todos",
        fabTitle: "Añadir nuevo contador",
        modalTitle: "Nuevo Contador",
        placeholderName: "Ej. Vasos de agua, Flexiones...",
        labelColor: "Color:",
        customColor: "Color personalizado",
        labelTags: "Etiquetas (separadas por comas):",
        placeholderTags: "Salud, Deporte, Leer...",
        cancel: "Cancelar",
        confirm: "Añadir",
        emptyState: "No hay contadores. ¡Añade uno con el botón de abajo a la derecha!",
        deleteConfirm: "¿Estás seguro de que quieres borrar \"{name}\"?",
        newTagPrompt: "Introduce el nombre de la nueva etiqueta:",
        deleteTitle: "Eliminar contador",
        menuTitle: "Ver etiquetas",
        langBtn: "ES",
        errorNameRequired: "Por favor, escribe un nombre para el contador.",
        editTags: "Editar etiquetas",
        deleteTagConfirm: "¿Borrar la etiqueta \"{name}\"? Esto no afectará a los contadores que ya la tengan."
    },
    en: {
        title: "My Counters",
        sidebarTitle: "Tags",
        addTag: "Add tag",
        allTags: "All",
        fabTitle: "Add new counter",
        modalTitle: "New Counter",
        placeholderName: "e.g. Water glasses, Pushups...",
        labelColor: "Color:",
        customColor: "Custom Color",
        labelTags: "Tags (comma separated):",
        placeholderTags: "Health, Sports, Reading...",
        cancel: "Cancel",
        confirm: "Add",
        emptyState: "No counters yet. Add one with the button below!",
        deleteConfirm: "Are you sure you want to delete \"{name}\"?",
        newTagPrompt: "Enter the name of the new tag:",
        deleteTitle: "Delete counter",
        menuTitle: "View tags",
        langBtn: "EN",
        errorNameRequired: "Please enter a name for the counter.",
        editTags: "Edit tags",
        deleteTagConfirm: "Delete tag \"{name}\"? This won't affect counters already using it."
    }
};

// --- LÓGICA DE JAVASCRIPT ---

// Referencias a los elementos del DOM
const counterNameInput = document.getElementById('counterName');
const counterTagsInput = document.getElementById('counterTags');
const addBtn = document.getElementById('addBtn');
const countersContainer = document.getElementById('countersContainer');
const fabAdd = document.getElementById('fabAdd');
const counterDialog = document.getElementById('counterDialog');
const cancelBtn = document.getElementById('cancelBtn');

// Referencias para el selector de color
const colorPresetsList = document.querySelectorAll('.color-preset');
const hiddenColorPicker = document.getElementById('counterColor');
const customBtn = document.querySelector('.custom-btn');

const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebar = document.getElementById('closeSidebar');
const addTagBtn = document.getElementById('addTagBtn');
const editTagsBtn = document.getElementById('editTagsBtn');
const tagsList = document.getElementById('tagsList');
const pageTitle = document.getElementById('pageTitle');
const langBtn = document.getElementById('langBtn');

// Estado de la aplicación
let counters = JSON.parse(localStorage.getItem('my_counters')) || [];
let customTags = JSON.parse(localStorage.getItem('my_custom_tags')) || [];
let currentTag = 'Todos';
let selectedColor = '#3498db';
let currentLang = localStorage.getItem('my_app_lang') || 'es';
let isEditingTags = false;

// --- MANEJO DE IDIOMA ---

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('my_app_lang', lang);
    const t = translations[lang];

    // Actualizar textos en el DOM
    document.title = t.title;
    pageTitle.textContent = currentTag === 'Todos' || currentTag === 'All' ? t.title : currentTag;
    document.getElementById('sidebarTitle').textContent = t.sidebarTitle;
    document.getElementById('addTagText').textContent = t.addTag;
    document.getElementById('editTagsText').textContent = t.editTags;
    document.getElementById('editTagsBtn').title = t.editTags;
    document.getElementById('modalTitle').textContent = t.modalTitle;
    document.getElementById('labelColor').textContent = t.labelColor;
    document.getElementById('labelTags').textContent = t.labelTags;
    document.getElementById('cancelBtn').textContent = t.cancel;
    document.getElementById('addBtn').textContent = t.confirm;
    langBtn.textContent = t.langBtn;

    // Placeholders y titles
    counterNameInput.placeholder = t.placeholderName;
    counterTagsInput.placeholder = t.placeholderTags;
    menuBtn.title = t.menuTitle;
    fabAdd.title = t.fabTitle;
    document.getElementById('customColorBtn').title = t.customColor;

    // Si el currentTag es el especial "Todos/All", lo actualizamos
    if (currentTag === 'Todos' || currentTag === 'All') {
        currentTag = t.allTags;
    }

    renderTags();
    renderCounters();
}

langBtn.addEventListener('click', () => {
    const nextLang = currentLang === 'es' ? 'en' : 'es';
    setLanguage(nextLang);
});

// --- MANEJO DE ETIQUETAS Y SIDEBAR ---

function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    renderTags();
}

function closeSidebarMenu() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
}

function renderTags() {
    tagsList.innerHTML = '';
    const t = translations[currentLang];
    
    // 1. Obtener etiquetas de los contadores que NO están en customTags
    const tagsFromCounters = new Set();
    counters.forEach(c => {
        if (c.tags) {
            c.tags.forEach(tag => {
                if (!customTags.includes(tag)) {
                    tagsFromCounters.add(tag);
                }
            });
        }
    });

    // 2. Las etiquetas automáticas (de contadores) se ordenan alfabéticamente
    const sortedAutoTags = Array.from(tagsFromCounters).sort();

    // 3. El orden final es: [Todos] + [customTags en su orden] + [etiquetas de contadores nuevas]
    const tagsArray = [t.allTags, ...customTags, ...sortedAutoTags];

    tagsArray.forEach((tag, index) => {
        const item = document.createElement('div');
        item.className = `tag-item ${tag === currentTag ? 'active' : ''}`;
        if (tag === t.allTags) item.classList.add('all-tags');
        
        if (isEditingTags && tag !== t.allTags) {
            item.classList.add('editing');
            item.draggable = true;
            
            // Icono de arrastrar
            const handle = document.createElement('span');
            handle.className = 'drag-handle';
            handle.textContent = '⋮⋮';
            item.appendChild(handle);
        }

        const text = document.createElement('span');
        text.className = 'tag-name';
        text.textContent = tag;
        item.appendChild(text);

        if (isEditingTags && tag !== t.allTags) {
            // Botón eliminar etiqueta
            const deleteTagBtn = document.createElement('button');
            deleteTagBtn.className = 'btn-delete-tag';
            deleteTagBtn.innerHTML = '🗑';
            deleteTagBtn.onclick = (e) => {
                e.stopPropagation();
                deleteCustomTag(tag);
            };
            item.appendChild(deleteTagBtn);

            // Eventos Drag & Drop
            item.addEventListener('dragstart', () => item.classList.add('dragging'));
            item.addEventListener('dragend', () => item.classList.remove('dragging'));
        }

        item.onclick = () => {
            if (isEditingTags) return;
            currentTag = tag;
            pageTitle.textContent = tag === t.allTags ? t.title : tag;
            renderCounters();
            closeSidebarMenu();
        };
        tagsList.appendChild(item);
    });

    if (isEditingTags) {
        setupDragAndDrop();
    }
}

function setupDragAndDrop() {
    tagsList.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(tagsList, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (afterElement == null) {
            tagsList.appendChild(dragging);
        } else {
            tagsList.insertBefore(dragging, afterElement);
        }
    });

    tagsList.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggables = Array.from(tagsList.querySelectorAll('.tag-item:not(.all-tags)'));
        const newOrder = draggables
            .map(item => item.querySelector('.tag-name').textContent);
        
        customTags = newOrder;
        localStorage.setItem('my_custom_tags', JSON.stringify(customTags));
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.tag-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function deleteCustomTag(tag) {
    const t = translations[currentLang];
    if (confirm(t.deleteTagConfirm.replace('{name}', tag))) {
        // Eliminar de las etiquetas personalizadas
        customTags = customTags.filter(at => at !== tag);
        localStorage.setItem('my_custom_tags', JSON.stringify(customTags));

        // Eliminar la etiqueta de todos los contadores
        counters = counters.map(counter => {
            if (counter.tags) {
                counter.tags = counter.tags.filter(t => t !== tag);
            }
            return counter;
        });
        localStorage.setItem('my_counters', JSON.stringify(counters));

        if (currentTag === tag) currentTag = t.allTags;
        renderTags();
        renderCounters();
    }
}

menuBtn.addEventListener('click', openSidebar);
closeSidebar.addEventListener('click', closeSidebarMenu);
sidebarOverlay.addEventListener('click', closeSidebarMenu);

editTagsBtn.addEventListener('click', () => {
    isEditingTags = !isEditingTags;
    editTagsBtn.classList.toggle('active', isEditingTags);
    renderTags();
});

addTagBtn.addEventListener('click', () => {
    const t = translations[currentLang];
    const newTagScreen = prompt(t.newTagPrompt);
    if (newTagScreen && newTagScreen.trim() !== '') {
        const tag = newTagScreen.trim();
        
        if (!customTags.includes(tag)) {
            customTags.push(tag);
            localStorage.setItem('my_custom_tags', JSON.stringify(customTags));
            renderTags(); // Actualizar la lista inmediatamente
        }
    }
});

// --- MANEJO DEL DIALOG ---

// Abrir modal al pulsar el FAB
fabAdd.addEventListener('click', () => {
    counterNameInput.value = '';
    counterTagsInput.value = '';
    
    // Resetear color por defecto
    selectedColor = '#3498db';
    colorPresetsList.forEach(p => {
        p.classList.toggle('active', p.dataset.color === selectedColor);
    });
    customBtn.style.backgroundColor = '#333';
    
    counterDialog.showModal();
});

// Manejo de presets de color
colorPresetsList.forEach(preset => {
    preset.addEventListener('click', () => {
        // Quitar active de todos
        colorPresetsList.forEach(p => p.classList.remove('active'));
        // Añadir active al pulsado
        preset.classList.add('active');
        // Actualizar color seleccionado
        selectedColor = preset.dataset.color;
        // Resetear el botón custom
        customBtn.style.backgroundColor = '#333';
    });
});

// Manejo del color picker personalizado (lápiz)
hiddenColorPicker.addEventListener('input', (e) => {
    const color = e.target.value;
    selectedColor = color;
    customBtn.style.backgroundColor = color;
    // Quitar active de los presets
    colorPresetsList.forEach(p => p.classList.remove('active'));
});

// Cerrar modal al pulsar cancelar
cancelBtn.addEventListener('click', () => {
    counterDialog.close();
});

// Manejar el submit del formulario del dialog
counterDialog.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    addCounter();
    counterDialog.close();
});

// Función para guardar el estado actual en el localStorage
function saveToLocalStorage() {
    localStorage.setItem('my_counters', JSON.stringify(counters));
}

// Función encargada de pintar los contadores en pantalla
function renderCounters() {
    countersContainer.innerHTML = ''; // Limpiamos el contenedor
    const t = translations[currentLang];

    const filteredCounters = (currentTag === t.allTags) 
        ? counters 
        : counters.filter(c => c.tags && c.tags.includes(currentTag));

    if (filteredCounters.length === 0) {
        countersContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #7f8c8d;">${t.emptyState}</p>`;
        return;
    }

    filteredCounters.forEach((counter, idx) => {
        // Buscamos el índice real en el array original para las funciones de borrar/update
        const originalIndex = counters.indexOf(counter);
        
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

        // Botón de eliminar (X)
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = t.deleteTitle;
        deleteBtn.onclick = () => deleteCounter(originalIndex);

        // Valor numérico
        const value = document.createElement('div');
        value.className = 'counter-value';
        value.textContent = counter.value;

        // Contenedor de etiquetas dentro de la tarjeta
        const tagsDisplay = document.createElement('div');
        tagsDisplay.className = 'counter-tags-display';
        if (counter.tags) {
            counter.tags.forEach(t => {
                const badge = document.createElement('span');
                badge.className = 'tag-badge';
                badge.textContent = t;
                tagsDisplay.appendChild(badge);
            });
        }

        // Contenedor de botones + y -
        const controls = document.createElement('div');
        controls.className = 'counter-controls';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'btn-control btn-minus';
        minusBtn.textContent = '-';
        minusBtn.style.backgroundColor = counter.color;
        minusBtn.onclick = () => updateValue(originalIndex, -1);

        const plusBtn = document.createElement('button');
        plusBtn.className = 'btn-control btn-plus';
        plusBtn.textContent = '+';
        plusBtn.style.backgroundColor = counter.color;
        plusBtn.onclick = () => updateValue(originalIndex, 1);

        // Ensamblamos la tarjeta
        controls.appendChild(minusBtn);
        controls.appendChild(plusBtn);
        
        card.appendChild(deleteBtn);
        card.appendChild(value);
        card.appendChild(tagsDisplay); // Añadimos etiquetas abajo
        card.appendChild(controls);

        // Ensamblamos el wrapper
        wrapper.appendChild(title);
        wrapper.appendChild(card);

        countersContainer.appendChild(wrapper);
    });
}

// Función para añadir un nuevo contador
function addCounter() {
    const t = translations[currentLang];
    const name = counterNameInput.value.trim();
    const color = selectedColor; // Usar la variable seleccionada
    const tagsRaw = counterTagsInput.value;
    
    // Procesar etiquetas (limpiar espacios y quitar vacías)
    const tags = tagsRaw.split(',')
        .map(t => t.trim())
        .filter(t => t !== '');

    if (name === '') {
        alert(t.errorNameRequired);
        return;
    }

    const newCounter = {
        name: name,
        value: 0,
        color: color,
        tags: tags
    };

    counters.push(newCounter);
    saveToLocalStorage();
    renderCounters();
}

// Función para actualizar el valor (+1 o -1)
function updateValue(index, change) {
    counters[index].value += change;
    saveToLocalStorage();
    renderCounters();
}

// Función para eliminar un contador
function deleteCounter(index) {
    const t = translations[currentLang];
    const counterName = counters[index].name;
    if(confirm(t.deleteConfirm.replace('{name}', counterName))) {
        counters.splice(index, 1); // Lo quitamos del array
        saveToLocalStorage();
        renderCounters();
    }
}

// --- EVENTOS ---
// addBtn.addEventListener('click', addCounter); // Ya lo manejamos con el submit del form

// Permitir añadir también pulsando la tecla "Enter" en el input
// (Esto se maneja automáticamente con el submit del form en el dialog)

// Renderizado inicial al cargar la página por primera vez
setLanguage(currentLang);