function register() {
    const username = document.getElementById('username').value;
    fetch(`/api/players/register/${username}`, {
        method: 'POST',
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            alert('Registration successful! Please log in.');
            window.location.href = '/';
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to register: ' + error.message);
        });
}