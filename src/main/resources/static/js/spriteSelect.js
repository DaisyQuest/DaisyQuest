let currentSprite = {
    background: 0,
    face: 0,
    eyes: 0,
    hairhat: 0
};

const spriteCounts = {
    background: 10,
    face: 10,
    eyes: 10,
    hairhat: 10
};

function updateSpritePreview() {
    const preview = document.getElementById('spritePreview');
    preview.innerHTML = `
        <img src="/sprites/background_${currentSprite.background}.png">
        <img src="/sprites/face_${currentSprite.face}.png">
        <img src="/sprites/eyes_${currentSprite.eyes}.png">
        <img src="/sprites/hairhat_${currentSprite.hairhat}.png">
    `;
}

function updateSpriteSelector(type, direction) {
    currentSprite[type] = (currentSprite[type] + direction + spriteCounts[type]) % spriteCounts[type];
    const selector = document.querySelector(`.sprite-selector[data-type="${type}"]`);
    selector.querySelector('.sprite-image').src = `/sprites/${type}_${currentSprite[type]}.png`;
    selector.querySelector('.sprite-count').textContent = `${currentSprite[type] + 1} / ${spriteCounts[type]}`;
    updateSpritePreview();
}

document.querySelectorAll('.sprite-selector').forEach(selector => {
    const type = selector.dataset.type;
    selector.querySelector('.left-btn').addEventListener('click', () => updateSpriteSelector(type, -1));
    selector.querySelector('.right-btn').addEventListener('click', () => updateSpriteSelector(type, 1));
});

function saveSprite() {
    fetch(`/api/players/${playerId}/sprite`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            subspriteBackground: `background_${currentSprite.background}`,
            subspriteFace: `face_${currentSprite.face}`,
            subspriteEyes: `eyes_${currentSprite.eyes}`,
            subspriteHairHat: `hairhat_${currentSprite.hairhat}`
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Sprite updated successfully');
            // Close the modal or show a success message
        })
        .catch(error => console.error('Error updating sprite:', error));
}

// Initialize the sprite selection interface
updateSpritePreview();
document.querySelectorAll('.sprite-selector').forEach(selector => {
    const type = selector.dataset.type;
    updateSpriteSelector(type, 0);
});