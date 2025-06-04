// wird am ende des bodys geladen, wenn alle elemente erstellt wurden (html)
document.addEventListener('DOMContentLoaded', () => 
{
    const form = document.getElementById('spendenForm');
    const spendenartRadios = document.querySelectorAll('input[name="spendenart"]');
    const abholdetails = document.getElementById('abholdetails');

    // prüft checked radiobutton und setzt dann hidden für abholdetails
    // standardmäßig ist übergabe in geschäftsstelle ausgewählt und abholdetails auf hidden
    function toggleAbholdetails() 
    {
        const checked = document.querySelector('input[name="spendenart"]:checked');
        abholdetails.classList.toggle('hidden', checked.value !== 'abholung');
    }
    // bei anklicken / change des radio buttons, wird function toggleAbholdetails aufgerufen
    spendenartRadios.forEach(radio => 
    {
        radio.addEventListener('change', toggleAbholdetails);
    });

    // button function
    form.addEventListener('submit', (e) => 
    {
        e.preventDefault();
        
        let canSend = true;

        // clear error msgs
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('input').forEach(el => el.classList.remove('error'));

        // regex für adresse, PLZ und ort
        //buchstaben + ausgewählte sonderzeichen + 
        const strasseRegex = /^[a-zA-ZäöüÄÖÜß\s\-\.]+ \d+[a-zA-Z]?$/;
        // buchstaben + ausgewählte sonderzeichen
        const ortRegex = /^[a-zA-ZäöüÄÖÜß\s\-\.]+$/;
        // PLZ anfangend mit 74
        const plzRegex = /^74\d{3}$/;

        
        // erstelle element div mit error-message klasse und füg es dem gleichen parent hinzu
        const showError = (element, elementType, message) => 
        {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = message;
            if (elementType === "input")
            {
                element.classList.add('error');
                element.parentElement.appendChild(errorMsg);
            }
            else if (elementType === "fieldset")
            {
                element.appendChild(errorMsg);
            }
        };
        // prüfe nur wenn !hidden
        if (!abholdetails.classList.contains('hidden')) 
        {
            const strasse = form.strasse;
            const plz = form.plz;
            const ort = form.ort;

            // straße prüfen
            if (!strasse.value.trim() || !strasseRegex.test(strasse.value.trim())) 
            {
                showError(strasse, 'input', 'Gültige Straße und Hausnummer angeben (z. B. Musterstraße 4a).');
                canSend = false;
            }
            // PLZ prüfen
            if (!plz.value.trim()) 
            {
                showError(plz, 'input', 'Bitte geben Sie eine PLZ an.');
                canSend = false;
            } 
            else if (!plzRegex.test(plz.value.trim())) 
            {
                showError(plz, 'Die PLZ muss mit 74 beginnen und 5-stellig sein.');
                canSend = false;
            }
            // ort prüfen
            if (!ort.value.trim() || !ortRegex.test(ort.value.trim())) 
            {
                showError(ort, 'input', 'Gültigen Ort angeben.');
                canSend = false;
            }
        }
        // mind. 1 art ausgewählt
        const kleidungSelect = form.querySelectorAll('input[name="kleidung"]:checked');
        if (kleidungSelect.length === 0) 
        {
            //3tes fieldset auswählen
            const kleidungFieldset = form.querySelector('fieldset:nth-of-type(3)');
            showError(kleidungFieldset, 'fieldset', 'Bitte mindestens eine Art der Kleidung auswählen.');
            canSend = false;
        }

        // wenn alle eingaben validiert sind
        if (canSend) {
            const formData = new FormData(form);
            const spendenart = formData.get('spendenart');
            const krisenregion = formData.get('krisenregion');
            const kleidungsarten = Array.from(form.querySelectorAll('input[name="kleidung"]:checked')).map(cb => cb.value).join(', ');

            const ort = form.ort.value.trim();
            const plz = form.plz.value.trim();
            const strasse = form.strasse.value.trim();

            const now = new Date();
            const datum = now.toLocaleDateString('de-DE');
            const zeit = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

            // schreibe box inhalt und entferne hidden
            const confirmation = document.getElementById('confirmation');
            confirmation.innerHTML = `
                <strong>Vielen Dank für Ihre Spende!</strong><br><br>
                ${spendenart === 'abholung' ? '<strong>Unser Abholservice wird Ihre Spende vor der Tür abholen.</strong><br><br>' : ''}
                <ul>
                    <li><strong>Spendenart:</strong> ${spendenart === 'abholung' ? 'Abholung' : 'Übergabe'}</li>
                    ${spendenart === 'abholung' ? `
                        <li><strong>Straße:</strong> ${strasse}</li>
                        <li><strong>PLZ:</strong> ${plz}</li>
                        <li><strong>Ort:</strong> ${ort}</li>` : ''
                    }
                    <li><strong>Art der Kleidung:</strong> ${kleidungsarten}</li>
                    <li><strong>Krisenregion:</strong> ${krisenregion}</li>
                    <li><strong>Datum:</strong> ${datum}</li>
                    <li><strong>Uhrzeit:</strong> ${zeit}</li>
                </ul>
            `;
            confirmation.classList.remove('hidden');

            form.reset();
            //update hidden element wegen reset (setzt default auf geschäftsstelle)
            toggleAbholdetails();

            // nach oben scrollen bis zur box
            // confirmation.scrollIntoView({ behavior: 'smooth' });
            // komplett nach oben scrollen für besser darstellung
            // window.scrollTo({ top: 0, behavior: 'smooth' });
            // nach oben scrollen, bis nach der navigationsleiste, dadurch übersichtlichere darstellung für mobile- und desktopbrowser
            window.scrollTo({
                top: document.querySelector('header').offsetHeight,
                behavior: 'smooth'
            });
        }
    });
});
