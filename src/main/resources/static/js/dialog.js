(() => {
    function getModalElements() {
        return {
            modal: document.getElementById('dialogModal'),
            title: document.getElementById('dialogModalTitle'),
            body: document.getElementById('dialogModalBody')
        };
    }

    function showDialog(payload) {
        const { modal, title, body } = getModalElements();
        if (!modal || !title || !body) {
            console.error('Dialog modal elements missing.');
            return;
        }
        title.textContent = payload?.title ?? 'Message';
        body.textContent = payload?.message ?? '';

        if (window.bootstrap?.Modal) {
            const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modal);
            modalInstance.show();
        } else {
            modal.classList.add('show');
            modal.style.display = 'block';
        }
    }

    function hideDialog() {
        const { modal } = getModalElements();
        if (!modal) {
            return;
        }
        if (window.bootstrap?.Modal) {
            const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modal);
            modalInstance.hide();
        } else {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }

    window.DialogUI = {
        showDialog,
        hideDialog
    };
})();
