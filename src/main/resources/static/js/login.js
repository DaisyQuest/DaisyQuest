function login() {
    const username = document.getElementById('username').value;
    fetch('/api/players', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username }),
    })
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('playerId', data.id);
            window.location.href = '/game';
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to log in. Please try again.');
        });
}
