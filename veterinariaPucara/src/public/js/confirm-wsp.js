(function () {
    const dataTag = document.getElementById('wsp-data');
    if (!dataTag) return;

    let data = {};
    try {
        data = JSON.parse(dataTag.textContent || '{}');
    } catch (_) { }

    const btn = document.getElementById('btn-si');
    if (!btn) return;

    const to = String(data.to || '');
    const msg = String(data.msg || '');
    const wspUrl = '/wsp/compose?to=' + encodeURIComponent(to) + '&msg=' + encodeURIComponent(msg);

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.open(wspUrl, '_blank', 'noopener,noreferrer');
        setTimeout(function () {
            window.location.href = '/citas?ok=1';
        }, 300);
    });
})();
