function login() {
    const username = document.getElementById('username').value;
    fetch(`/api/players/login/${username}`, {
        method: 'POST',
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('playerId', data.id);
            window.location.href = '/game';
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to log in: ' + error.message);
        });
}
