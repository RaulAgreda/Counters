// --- TRADUCCIONES ---
const translations = {
    es: {
        title: "Mis Contadores",
        sidebarTitle: "Etiquetas",
        addTag: "Añadir etiqueta",
        allTags: "Todos",
        fabTitle: "Añadir nuevo contador",
        modalTitle: "Nuevo Contador",
        modalTitleEdit: "Editar Contador",
        placeholderName: "Ej. Vasos de agua, Flexiones...",
        labelColor: "Color:",
        customColor: "Color personalizado",
        labelTags: "Etiquetas:",
        placeholderTags: "Salud, Deporte, Leer...",
        cancel: "Cancelar",
        confirm: "Añadir",
        confirmEdit: "Guardar",
        emptyState: "No hay contadores. ¡Añade uno con el botón de abajo a la derecha!",
        deleteConfirm: "¿Estás seguro de que quieres borrar \"{name}\"?",
        deleteMultipleConfirm: "¿Estás seguro de que quieres borrar {count} contadores?",
        newTagPrompt: "Introduce el nombre de la nueva etiqueta:",
        modalTitleTag: "Nueva Etiqueta",
        placeholderTag: "Ej. Salud, Deporte...",
        deleteTitle: "Eliminar contador",
        menuTitle: "Ver etiquetas",
        langBtn: "ES",
        errorNameRequired: "Por favor, escribe un nombre para el contador.",
        editTags: "Editar etiquetas",
        deleteTagConfirm: "¿Borrar la etiqueta \"{name}\"? Esto no afectará a los contadores que ya la tengan.",
        resetSelectionConfirm: "¿Reiniciar a 0 los {count} contadores seleccionados?",
        muteTitle: "Silenciar",
        unmuteTitle: "Activar sonido"
    },
    en: {
        title: "My Counters",
        sidebarTitle: "Tags",
        addTag: "Add tag",
        allTags: "All",
        fabTitle: "Add new counter",
        modalTitle: "New Counter",
        modalTitleEdit: "Edit Counter",
        placeholderName: "e.g. Water glasses, Pushups...",
        labelColor: "Color:",
        customColor: "Custom Color",
        labelTags: "Tags:",
        placeholderTags: "Health, Sports, Reading...",
        cancel: "Cancel",
        confirm: "Add",
        confirmEdit: "Save",
        emptyState: "No counters yet. Add one with the button below!",
        deleteConfirm: "Are you sure you want to delete \"{name}\"?",
        deleteMultipleConfirm: "Are you sure you want to delete {count} counters?",
        newTagPrompt: "Enter the name of the new tag:",
        modalTitleTag: "New Tag",
        placeholderTag: "e.g. Health, Sports...",
        deleteTitle: "Delete counter",
        menuTitle: "View tags",
        langBtn: "EN",
        errorNameRequired: "Please enter a name for the counter.",
        editTags: "Edit tags",
        deleteTagConfirm: "Delete tag \"{name}\"? This won't affect counters already using it.",
        resetSelectionConfirm: "Reset the {count} selected counters to 0?",
        muteTitle: "Mute",
        unmuteTitle: "Unmute"
    }
};

// --- LÓGICA DE JAVASCRIPT ---

// Referencias a los elementos del DOM
const counterNameInput = document.getElementById('counterName');
const modalTagsList = document.getElementById('modalTagsList');
const addBtn = document.getElementById('addBtn');
const countersContainer = document.getElementById('countersContainer');
const fabAdd = document.getElementById('fabAdd');
const muteBtn = document.getElementById('muteBtn');
const muteIcon = document.getElementById('muteIcon');
const counterDialog = document.getElementById('counterDialog');
const cancelBtn = document.getElementById('cancelBtn');

// Referencias para el diálogo de etiquetas
const tagDialog = document.getElementById('tagDialog');
const tagNameInput = document.getElementById('tagNameInput');
const cancelTagBtn = document.getElementById('cancelTagBtn');
const modalTitleTag = document.getElementById('modalTitleTag');

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

// Referencias para selección múltiple
const mainHeader = document.getElementById('mainHeader');
const selectionHeader = document.getElementById('selectionHeader');
const selectionCount = document.getElementById('selectionCount');
const cancelSelectionBtn = document.getElementById('cancelSelectionBtn');
const editSelectionBtn = document.getElementById('editSelectionBtn');
const resetSelectionBtn = document.getElementById('resetSelectionBtn');
const deleteSelectionBtn = document.getElementById('deleteSelectionBtn');

// Estado de la aplicación
let counters = JSON.parse(localStorage.getItem('my_counters')) || [];
// Asegurar que todos los contadores tengan un ID único para el tracking
counters.forEach(c => { if (!c.id) c.id = Date.now() + Math.random(); });

let customTags = JSON.parse(localStorage.getItem('my_custom_tags')) || [];
let currentTag = 'Todos';
let selectedColor = '#3498db';
let currentLang = localStorage.getItem('my_app_lang') || 'es';
let isEditingTags = false;
let selectedCountersIDs = []; // IDs de los contadores seleccionados
let tempSelectedTags = []; // Etiquetas seleccionadas temporalmente en el modal
let editingIndex = null; // Índice del contador que se está editando
let tagSubmitCallback = null; // Callback para el diálogo de etiquetas
let pressTimer;

// --- GESTIÓN DE SONIDO (Web Audio API para baja latencia) ---
let audioCtx;
let soundBuffer;
let isMuted = JSON.parse(localStorage.getItem('my_app_muted')) || false;

async function initAudio() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch('tap.mp3');
        const arrayBuffer = await response.arrayBuffer();
        soundBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error("Error al cargar el sonido:", e);
    }
}

function playTapSound() {
    if (isMuted || !audioCtx || !soundBuffer) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const source = audioCtx.createBufferSource();
    source.buffer = soundBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
}

function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('my_app_muted', JSON.stringify(isMuted));
    updateMuteUI();
}

function updateMuteUI() {
    const t = translations[currentLang];
    muteIcon.textContent = isMuted ? 'volume_off' : 'volume_up';
    muteBtn.title = isMuted ? t.unmuteTitle : t.muteTitle;
}

// --- INICIALIZACIÓN ---

function init() {
    setLanguage(currentLang);
    setupCountersDragAndDrop();
    initAudio();
    updateMuteUI();
    registerOfflineApp();
}

function registerOfflineApp() {
    if ('serviceWorker' in navigator && window.isSecureContext) {
        navigator.serviceWorker.register('./sw.js').catch(error => console.warn('No se pudo activar el modo offline instalable:', error));
    }
}

function handleCounterReorder() {
    const t = translations[currentLang];
    const draggables = Array.from(countersContainer.querySelectorAll('.counter-wrapper:not(.empty-msg)'));
    const newOrderIDs = draggables.map(w => parseFloat(w.dataset.id));
    
    let newCounters = [...counters];
    
    if (currentTag === t.allTags) {
        newCounters = newOrderIDs.map(id => counters.find(c => c.id === id));
    } else {
        const filteredIndices = counters
            .map((c, i) => (c.tags && c.tags.includes(currentTag)) ? i : -1)
            .filter(i => i !== -1);
        
        const reorderedFiltered = newOrderIDs.map(id => counters.find(c => c.id === id));
        filteredIndices.forEach((originalIdx, i) => {
            newCounters[originalIdx] = reorderedFiltered[i];
        });
    }
    
    counters = newCounters;
    saveToLocalStorage();
    renderCounters();
}

function setupCountersDragAndDrop() {
    countersContainer.addEventListener('dragover', e => {
        e.preventDefault();
        const dragging = document.querySelector('.counter-wrapper.dragging');
        if (!dragging) return;

        const afterElement = getDragAfterElement(countersContainer, e.clientY, e.clientX);
        if (afterElement == null) {
            countersContainer.appendChild(dragging);
        } else {
            countersContainer.insertBefore(dragging, afterElement);
        }
    });

    countersContainer.addEventListener('drop', handleCounterReorder);

    // Soporte para Touch Reorder
    countersContainer.addEventListener('touchmove', e => {
        const dragging = document.querySelector('.counter-wrapper.dragging');
        if (!dragging) return;
        
        e.preventDefault(); // Evitar scroll mientras se arrastra
        const touch = e.touches[0];
        const afterElement = getDragAfterElement(countersContainer, touch.clientY, touch.clientX);
        if (afterElement == null) {
            countersContainer.appendChild(dragging);
        } else {
            countersContainer.insertBefore(dragging, afterElement);
        }
    }, { passive: false });

    countersContainer.addEventListener('touchend', () => {
        const dragging = document.querySelector('.counter-wrapper.dragging');
        if (dragging) {
            dragging.classList.remove('dragging');
            handleCounterReorder();
        }
    });
}

// --- MANEJO DE IDIOMA ---

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('my_app_lang', lang);
    const t = translations[lang];

    // Actualizar textos en el DOM
    document.title = t.title;
    const isMainTitle = currentTag === 'Todos' || currentTag === 'All' || currentTag === t.allTags;
    if (isMainTitle) {
        pageTitle.textContent = t.title;
    } else {
        pageTitle.innerHTML = `<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">sell</span>${currentTag}`;
    }
    document.getElementById('sidebarTitle').textContent = t.sidebarTitle;
    document.getElementById('addTagText').textContent = t.addTag;
    document.getElementById('editTagsText').textContent = t.editTags;
    document.getElementById('editTagsBtn').title = t.editTags;
    modalTitleTag.textContent = t.modalTitleTag;
    tagNameInput.placeholder = t.placeholderTag;
    document.getElementById('cancelTagBtn').textContent = t.cancel;
    document.getElementById('confirmTagBtn').textContent = t.confirm;
    document.getElementById('modalTitle').textContent = t.modalTitle;
    document.getElementById('labelColor').textContent = t.labelColor;
    document.getElementById('labelTags').textContent = t.labelTags;
    document.getElementById('cancelBtn').textContent = t.cancel;
    document.getElementById('addBtn').textContent = t.confirm;
    langBtn.textContent = t.langBtn;

    // Placeholders y titles
    counterNameInput.placeholder = t.placeholderName;
    menuBtn.title = t.menuTitle;
    fabAdd.title = t.fabTitle;
    updateMuteUI();
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
            
            // Soporte touch drag
            item.addEventListener('touchstart', () => {
                if (isEditingTags) {
                    item.classList.add('dragging');
                }
            });

            // Icono de arrastrar
            const handle = document.createElement('span');
            handle.className = 'drag-handle';
            handle.textContent = '⋮⋮';
            item.appendChild(handle);
        }

        const text = document.createElement('span');
        text.className = 'tag-name';
        text.dataset.name = tag; // Guardamos el nombre real sin icono
        
        const iconName = (tag === t.allTags) ? 'home' : 'sell';
        text.innerHTML = `<span class="material-symbols-outlined tag-name-icon">${iconName}</span>${tag}`;
        item.appendChild(text);

        if (isEditingTags && tag !== t.allTags) {
            // Botón eliminar etiqueta
            const deleteTagBtn = document.createElement('button');
            deleteTagBtn.className = 'btn-delete-tag';
            deleteTagBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
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
            const isMainTitle = tag === t.allTags;
            if (isMainTitle) {
                pageTitle.textContent = t.title;
            } else {
                pageTitle.innerHTML = `<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">sell</span>${tag}`;
            }
            renderCounters();
            closeSidebarMenu();
        };
        tagsList.appendChild(item);
    });

    if (isEditingTags) {
        setupDragAndDrop();
    }
}

function handleTagReorder() {
    const draggables = Array.from(tagsList.querySelectorAll('.tag-item:not(.all-tags)'));
    const newOrder = draggables
        .map(item => item.querySelector('.tag-name').dataset.name);
    
    customTags = newOrder;
    localStorage.setItem('my_custom_tags', JSON.stringify(customTags));
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
        handleTagReorder();
    });

    // Soporte Touch para etiquetas
    tagsList.addEventListener('touchmove', e => {
        const dragging = document.querySelector('.tag-item.dragging');
        if (!dragging) return;

        e.preventDefault();
        const touch = e.touches[0];
        const afterElement = getDragAfterElement(tagsList, touch.clientY);
        if (afterElement == null) {
            tagsList.appendChild(dragging);
        } else {
            tagsList.insertBefore(dragging, afterElement);
        }
    }, { passive: false });

    tagsList.addEventListener('touchend', () => {
        const dragging = document.querySelector('.tag-item.dragging');
        if (dragging) {
            dragging.classList.remove('dragging');
            handleTagReorder();
            renderTags();
        }
    });
}

function getDragAfterElement(container, y, x) {
    const selector = container === tagsList ? '.tag-item:not(.dragging)' : '.counter-wrapper:not(.dragging)';
    const draggableElements = [...container.querySelectorAll(selector)];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        
        // Para listas verticales (tags)
        if (container === tagsList) {
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            }
        } 
        // Para el grid de contadores
        else {
            const offsetY = y - box.top - box.height / 2;
            const offsetX = x - box.left - box.width / 2;
            
            // Si estamos en la misma fila (aproximadamente)
            if (Math.abs(offsetY) < box.height / 2) {
                if (offsetX < 0 && offsetX > closest.offset) {
                    return { offset: offsetX, element: child };
                }
            } else if (offsetY < 0 && offsetY > closest.offsetY) {
                return { offset: offsetX, element: child, offsetY: offsetY };
            }
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY, offsetY: Number.NEGATIVE_INFINITY }).element;
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

        if (currentTag === tag) {
            currentTag = t.allTags;
            pageTitle.textContent = t.title;
        }
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
    tagNameInput.value = '';
    tagSubmitCallback = (tag) => {
        if (!customTags.includes(tag)) {
            customTags.push(tag);
            localStorage.setItem('my_custom_tags', JSON.stringify(customTags));
            renderTags();
        }
    };
    tagDialog.showModal();
});

// --- MANEJO DEL DIALOG ---

// Abrir modal al pulsar el FAB
fabAdd.addEventListener('click', () => {
    editingIndex = null;
    const t = translations[currentLang];
    document.getElementById('modalTitle').textContent = t.modalTitle;
    document.getElementById('addBtn').textContent = t.confirm;

    counterNameInput.value = '';
    tempSelectedTags = [];
    if (currentTag !== t.allTags) {
        tempSelectedTags.push(currentTag);
    }
    renderModalTags();
    
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

cancelTagBtn.addEventListener('click', () => {
    tagDialog.close();
});

// Manejar el submit del formulario del tag dialog
tagDialog.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const tag = tagNameInput.value.trim();
    if (tag && tagSubmitCallback) {
        tagSubmitCallback(tag);
    }
    tagDialog.close();
});

// Manejar el submit del formulario del dialog
counterDialog.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
        updateCounter();
    } else {
        addCounter();
    }
    counterDialog.close();
});

// --- LÓGICA DE SELECCIÓN ---

function updateSelectionUI() {
    const t = translations[currentLang];
    const isSelecting = selectedCountersIDs.length > 0;
    
    mainHeader.classList.toggle('hidden', isSelecting);
    selectionHeader.classList.toggle('hidden', !isSelecting);
    
    selectionCount.textContent = selectedCountersIDs.length;
    
    // El botón editar solo se muestra si hay 1 seleccionado
    editSelectionBtn.style.display = selectedCountersIDs.length === 1 ? 'flex' : 'none';
}

function clearSelection() {
    selectedCountersIDs = [];
    updateSelectionUI();
    renderCounters();
}

function deleteSelectedCounters() {
    const t = translations[currentLang];
    if (confirm(t.deleteMultipleConfirm.replace('{count}', selectedCountersIDs.length))) {
        // Filtramos el array de contadores para quitar los que tienen IDs seleccionados
        counters = counters.filter(c => !selectedCountersIDs.includes(c.id));
        saveToLocalStorage();
        clearSelection();
    }
}

function resetSelectedCounters() {
    const t = translations[currentLang];
    if (confirm(t.resetSelectionConfirm.replace('{count}', selectedCountersIDs.length))) {
        counters.forEach(c => {
            if (selectedCountersIDs.includes(c.id)) {
                c.value = 0;
            }
        });
        saveToLocalStorage();
        clearSelection();
    }
}

function openEditModal() {
    if (selectedCountersIDs.length !== 1) return;
    
    const selectedID = selectedCountersIDs[0];
    const idx = counters.findIndex(c => c.id === selectedID);
    if (idx === -1) return;
    
    const counter = counters[idx];
    editingIndex = idx;
    
    const t = translations[currentLang];
    document.getElementById('modalTitle').textContent = t.modalTitleEdit;
    document.getElementById('addBtn').textContent = t.confirmEdit;
    
    counterNameInput.value = counter.name;
    tempSelectedTags = counter.tags ? [...counter.tags] : [];
    renderModalTags();
    selectedColor = counter.color;
    
    // Actualizar visualmente los presets
    colorPresetsList.forEach(p => {
        p.classList.toggle('active', p.dataset.color === selectedColor);
    });
    // Si es un color personalizado, mostrarlo en el botón custom
    const isPreset = Array.from(colorPresetsList).some(p => p.dataset.color === selectedColor);
    customBtn.style.backgroundColor = isPreset ? '#333' : selectedColor;
    hiddenColorPicker.value = selectedColor;
    
    counterDialog.showModal();
}

function updateCounter() {
    if (editingIndex === null) return;
    
    const name = counterNameInput.value.trim();
    if (!name) return;
    
    const tagsArray = [...tempSelectedTags];
    
    counters[editingIndex].name = name;
    counters[editingIndex].color = selectedColor;
    counters[editingIndex].tags = tagsArray;
    
    // Asegurarnos de que las nuevas etiquetas estén en customTags si no existen
    tagsArray.forEach(tag => {
        if (!customTags.includes(tag)) {
            customTags.push(tag);
        }
    });
    localStorage.setItem('my_custom_tags', JSON.stringify(customTags));
    
    saveToLocalStorage();
    editingIndex = null;
    clearSelection();
    renderTags();
}

cancelSelectionBtn.addEventListener('click', clearSelection);
deleteSelectionBtn.addEventListener('click', deleteSelectedCounters);
resetSelectionBtn.addEventListener('click', resetSelectedCounters);
editSelectionBtn.addEventListener('click', openEditModal);

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
        countersContainer.innerHTML = `<p class="empty-msg" style="grid-column: 1/-1; text-align: center; color: #7f8c8d;">${t.emptyState}</p>`;
        return;
    }

    filteredCounters.forEach((counter, idx) => {
        // Buscamos el índice real en el array original para las funciones de borrar/update
        const originalIndex = counters.indexOf(counter);
        
        // Contenedor principal del ítem
        const wrapper = document.createElement('div');
        wrapper.className = 'counter-wrapper';
        wrapper.dataset.id = counter.id;
        if (selectedCountersIDs.includes(counter.id)) {
            wrapper.classList.add('selected');
        }
        wrapper.draggable = false; // Se activará con el long-press

        // Lógica de marcado (Long Press) y Selección
        const handleToggleSelect = () => {
            if (selectedCountersIDs.length > 0) {
                if (selectedCountersIDs.includes(counter.id)) {
                    selectedCountersIDs = selectedCountersIDs.filter(id => id !== counter.id);
                } else {
                    selectedCountersIDs.push(counter.id);
                }
                updateSelectionUI();
                renderCounters();
            }
        };

        const startPress = (e) => {
            const eventPath = e.composedPath ? e.composedPath() : [e.target];
            const comesFromControl = eventPath.some(element =>
                element?.classList?.contains('btn-control') ||
                element?.classList?.contains('btn-delete')
            );
            if (comesFromControl) {
                clearTimeout(pressTimer);
                return;
            }
            pressTimer = setTimeout(() => {
                if (selectedCountersIDs.length === 0) {
                    selectedCountersIDs.push(counter.id);
                    updateSelectionUI();
                    renderCounters();
                    
                    // Buscar el nuevo wrapper creado tras renderCounters y añadirle la clase dragging
                    const newWrapper = countersContainer.querySelector(`[data-id="${counter.id}"]`);
                    if (newWrapper) {
                        newWrapper.classList.add('dragging');
                    }
                    
                    if (window.navigator.vibrate) window.navigator.vibrate(50);
                }
            }, 600);
        };

        const endPress = () => {
            clearTimeout(pressTimer);
        };

        wrapper.onclick = handleToggleSelect;
        wrapper.addEventListener('mousedown', startPress);
        wrapper.addEventListener('touchstart', startPress);
        wrapper.addEventListener('mouseup', endPress);
        wrapper.addEventListener('mouseleave', endPress);
        wrapper.addEventListener('touchend', endPress);

        // Eventos Drag & Drop
        wrapper.addEventListener('dragstart', () => {
            wrapper.classList.add('dragging');
        });

        wrapper.addEventListener('dragend', () => {
            wrapper.classList.remove('dragging');
            wrapper.classList.remove('selected');
            wrapper.draggable = false;
        });

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
        if (counter.tags && counter.tags.length > 0) {
            const tagIcon = document.createElement('span');
            tagIcon.className = 'material-symbols-outlined card-tag-icon';
            tagIcon.textContent = 'sell';
            tagsDisplay.appendChild(tagIcon);

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
        setupContinuousControl(minusBtn, originalIndex, -1, value);

        const plusBtn = document.createElement('button');
        plusBtn.className = 'btn-control btn-plus';
        plusBtn.textContent = '+';
        plusBtn.style.backgroundColor = counter.color;
        setupContinuousControl(plusBtn, originalIndex, 1, value);

        // Ensamblamos la tarjeta
        controls.appendChild(minusBtn);
        controls.appendChild(plusBtn);
        
        // card.appendChild(deleteBtn);
        card.appendChild(value);
        card.appendChild(tagsDisplay); // Añadimos etiquetas abajo
        card.appendChild(controls);

        // Ensamblamos el wrapper
        wrapper.appendChild(title);
        wrapper.appendChild(card);

        countersContainer.appendChild(wrapper);
    });
}

// --- LÓGICA DEL MODAL DE ETIQUETAS ---

function renderModalTags() {
    modalTagsList.innerHTML = '';
    const t = translations[currentLang];

    // Obtener todas las etiquetas disponibles (incluyendo las de los contadores)
    const allAvailableTags = new Set(customTags);
    counters.forEach(c => {
        if (c.tags) {
            c.tags.forEach(tag => allAvailableTags.add(tag));
        }
    });

    // Ordenar alfabéticamente
    const sortedTags = Array.from(allAvailableTags).sort();

    sortedTags.forEach(tag => {
        const pill = document.createElement('div');
        pill.className = `modal-tag-pill ${tempSelectedTags.includes(tag) ? 'selected' : ''}`;
        pill.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle; margin-right: 4px;">sell</span>${tag}`;
        pill.onclick = () => {
            if (tempSelectedTags.includes(tag)) {
                tempSelectedTags = tempSelectedTags.filter(t => t !== tag);
            } else {
                tempSelectedTags.push(tag);
            }
            renderModalTags();
        };
        modalTagsList.appendChild(pill);
    });

    // Botón para añadir nueva etiqueta desde el modal
    const addPill = document.createElement('button');
    addPill.type = 'button';
    addPill.className = 'modal-tag-add';
    addPill.textContent = `+ ${t.addTag}`;
    addPill.onclick = () => {
        tagNameInput.value = '';
        tagSubmitCallback = (tag) => {
            if (!customTags.includes(tag)) {
                customTags.push(tag);
                localStorage.setItem('my_custom_tags', JSON.stringify(customTags));
                renderTags(); // Actualizar el sidebar
            }
            if (!tempSelectedTags.includes(tag)) {
                tempSelectedTags.push(tag);
            }
            renderModalTags();
        };
        tagDialog.showModal();
    };
    modalTagsList.appendChild(addPill);
}

// Función para añadir un nuevo contador
function addCounter() {
    const t = translations[currentLang];
    const name = counterNameInput.value.trim();
    const color = selectedColor; // Usar la variable seleccionada
    const tags = [...tempSelectedTags];

    if (name === '') {
        alert(t.errorNameRequired);
        return;
    }

    const newCounter = {
        id: Date.now() + Math.random(),
        name: name,
        value: 0,
        color: color,
        tags: tags
    };

    // Asegurarnos de que las nuevas etiquetas estén en customTags si no existen
    tags.forEach(tag => {
        if (!customTags.includes(tag)) {
            customTags.push(tag);
        }
    });
    localStorage.setItem('my_custom_tags', JSON.stringify(customTags));

    counters.push(newCounter);
    saveToLocalStorage();
    renderCounters();
}

// Configura una pulsación normal o continua con dos velocidades.
function setupContinuousControl(button, index, change, valueElement) {
    const INITIAL_DELAY = 450;
    const SLOW_INTERVAL = 300;
    const FAST_INTERVAL = 90;
    const FAST_AFTER = 2000;

    let repeatTimer = null;
    let pressStartedAt = 0;
    let isPressed = false;

    button.draggable = false;

    const disableParentDrag = () => {
        clearTimeout(pressTimer);
        const wrapper = button.closest('.counter-wrapper');
        if (!wrapper) return;
        wrapper.draggable = false;
        wrapper.classList.remove('dragging');
    };

    // Bloquea los gestos nativos táctiles para que la pulsación larga no
    // seleccione contenido ni active el arrastre de la tarjeta contenedora.
    const blockNativeTouch = (event) => {
        event.preventDefault();
        event.stopPropagation();
        disableParentDrag();
    };

    button.addEventListener('touchstart', blockNativeTouch, { passive: false });
    button.addEventListener('touchmove', blockNativeTouch, { passive: false });
    button.addEventListener('touchend', (event) => event.stopPropagation());
    button.addEventListener('touchcancel', (event) => event.stopPropagation());

    const repeat = () => {
        if (!isPressed) return;

        updateValue(index, change, valueElement, false);
        const elapsed = performance.now() - pressStartedAt;
        const accelerationProgress = Math.min(
            Math.max((elapsed - INITIAL_DELAY) / (FAST_AFTER - INITIAL_DELAY), 0),
            1
        );
        const nextInterval = SLOW_INTERVAL +
            (FAST_INTERVAL - SLOW_INTERVAL) * accelerationProgress;
        repeatTimer = setTimeout(repeat, nextInterval);
    };

    const stop = (event) => {
        if (event) event.stopPropagation();
        isPressed = false;
        clearTimeout(repeatTimer);
        repeatTimer = null;
        button.classList.remove('is-pressed');
    };

    button.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || isPressed) return;

        event.preventDefault();
        event.stopPropagation();
        disableParentDrag();
        isPressed = true;
        pressStartedAt = performance.now();
        button.classList.add('is-pressed');
        button.setPointerCapture?.(event.pointerId);

        updateValue(index, change, valueElement);
        repeatTimer = setTimeout(repeat, INITIAL_DELAY);
    });

    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('lostpointercapture', stop);
    button.addEventListener('pointermove', (event) => {
        if (!isPressed) return;
        event.preventDefault();
        event.stopPropagation();
        disableParentDrag();
    });

    // Chrome/Edge también generan eventos de ratón compatibles después de
    // los eventos de puntero. Se detienen para que no lleguen al wrapper.
    button.addEventListener('mousedown', blockNativeTouch);
    button.addEventListener('mouseup', (event) => event.stopPropagation());
    button.addEventListener('selectstart', blockNativeTouch);
    button.addEventListener('contextmenu', blockNativeTouch);
    button.addEventListener('dragstart', blockNativeTouch);

    // Conserva el uso por teclado y evita sumar otra vez tras pointerup.
    button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.detail === 0) updateValue(index, change, valueElement);
    });
}

// Función para actualizar el valor (+1 o -1)
function updateValue(index, change, valueElement = null, withSound = true) {
    if (withSound) playTapSound();
    counters[index].value += change;
    saveToLocalStorage();

    if (valueElement?.isConnected) {
        valueElement.textContent = counters[index].value;
    } else {
        renderCounters();
    }
}

// Función para eliminar un contador
function deleteCounter(index) {
    const t = translations[currentLang];
    const counterName = counters[index].name;
    if(confirm(t.deleteConfirm.replace('{name}', counterName))) {
        counters.splice(index, 1); // Lo quitamos del array
        saveToLocalStorage();
        clearSelection(); // Limpiar selección por seguridad
        renderCounters();
    }
}

// --- EVENTOS ---
// addBtn.addEventListener('click', addCounter); // Ya lo manejamos con el submit del form

muteBtn.addEventListener('click', toggleMute);

// Permitir añadir también pulsando la tecla "Enter" en el input
// (Esto se maneja automáticamente con el submit del form en el dialog)

// Inicialización de la aplicación
// Deseleccionar al hacer click fuera de un contador
document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.counter-wrapper') && !e.target.closest('.selection-header')) {
        clearSelection();
    }
});

init();
