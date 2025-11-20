import {ref} from "vue";

export function useDraggable() {
    const isDragging = ref(false);
    const panelPosition = ref({ x: 8, y: 68 });
    const initialMousePosition = ref({ x: 0, y: 0 });

    function startDrag(event: MouseEvent) {
        isDragging.value = true;
        initialMousePosition.value = { x: event.clientX, y: event.clientY };
    }

    function onDrag(event: MouseEvent) {
        if (!isDragging.value) return;

        // Calculez la différence entre la position actuelle de la souris et la position initiale
        const deltaX = event.clientX - initialMousePosition.value.x;
        const deltaY = event.clientY - initialMousePosition.value.y;

        // Mettez à jour la position du panel
        panelPosition.value = {
            x: panelPosition.value.x + deltaX,
            y: panelPosition.value.y - deltaY,
        };

        // Mettez à jour la position initiale de la souris pour le prochain mouvement
        initialMousePosition.value = { x: event.clientX, y: event.clientY };
    }

    function stopDrag() {
        isDragging.value = false;
    }

    return {
        isDragging,
        panelPosition,
        initialMousePosition,
        startDrag,
        onDrag,
        stopDrag,
    }
}