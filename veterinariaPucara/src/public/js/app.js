(function () {
    const pet = document.getElementById('pet');
    const chat = document.getElementById('petChat');
    const chatBody = document.getElementById('chatBody');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');

    lottie.loadAnimation({
        container: document.getElementById('petAnim'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/anim/a-cat.json'
    });

    pet.addEventListener('click', () => {
        if (!chat.classList.contains('open')) {
            chat.classList.add('open');
            pet.classList.add('open');
            positionChat();
            setTimeout(() => input.focus(), 60);
        } else {
            chat.classList.remove('open');
            pet.classList.remove('open');
        }
    });

    window.addEventListener('resize', () => {
        if (chat.classList.contains('open')) positionChat();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        addMsg(text, 'user');
        input.value = '';
        const thinking = addMsg('Pensando…', 'bot');

        try {
            const res = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            updateMsg(thinking, data.reply ?? 'Sin respuesta');
            positionChat();
        } catch {
            updateMsg(thinking, 'Ups, hubo un error al contactar al asistente.');
            positionChat();
        }
    });

    function addMsg(content, who) {
        const div = document.createElement('div');
        div.className = 'msg ' + who;
        div.textContent = content;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return div;
    }

    function updateMsg(el, content) {
        el.textContent = content;
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function positionChat() {
        chat.style.left = '';
        chat.style.top = '';
        const pad = 8;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const petRect = pet.getBoundingClientRect();
        const chatRect = chat.getBoundingClientRect();

        const centerX = petRect.left + petRect.width / 2;
        let left = centerX - chatRect.width / 2;
        let top = petRect.top - chatRect.height - 12;

        if (left < pad) left = pad;
        if (left + chatRect.width > vw - pad) left = vw - pad - chatRect.width;
        if (top < pad) top = Math.min(petRect.bottom + 12, vh - pad - chatRect.height);

        chat.style.left = Math.round(left) + 'px';
        chat.style.top = Math.round(top) + 'px';
    }
})();
