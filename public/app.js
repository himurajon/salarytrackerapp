document.addEventListener('DOMContentLoaded', () => {
    const SALARY_DAY = 12;
    const loader = document.getElementById('loader');
    const container = document.querySelector('.container');

    const formatMoney = (num) => new Intl.NumberFormat('uz-UZ').format(num);

    const getLocalDate = (d) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 10);
    };

    const showLoader = () => {
        loader.classList.remove('hidden');
        container.classList.add('loading-blur');
    };
    const hideLoader = () => {
        loader.classList.add('hidden');
        container.classList.remove('loading-blur');
    };

    async function loadAllData(silent = false) {
        if (!silent) showLoader();
        try {
            const res = await fetch('/api/loadData');
            const { base, payments } = await res.json();

            document.getElementById('baseSalary').value = base;
            renderMainTable(base, payments);
            
            if (!document.getElementById('historyBox').classList.contains('hidden')) {
                renderHistoryTable(base, payments);
            }
        } catch (err) {
            console.error(err);
        } finally {
            hideLoader();
        }
    }

    function renderMainTable(base, payments) {
        const tableBody = document.getElementById('tableBody');
        let rowsHTML = '';
        let balance = base;
        const todayStr = getLocalDate(new Date());
        const start = new Date();
        start.setDate(start.getDate() - 40);

        for (let i = 0; i < 50; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const date = getLocalDate(d);

            if (d.getDate() === SALARY_DAY && i !== 0) balance += base;
            const taken = payments[date] || 0;
            balance -= taken;

            const isToday = (date === todayStr);
            rowsHTML += `
                <tr class="${isToday ? 'today-row' : ''}">
                    <td class="readonly">${isToday ? `<b>${date}</b>` : date}</td>
                    <td>
                        <input type="number" value="${taken}" 
                               onchange="updatePayment('${date}', this.value)">
                    </td>
                    <td class="readonly money-cell">${formatMoney(balance)}</td>
                </tr>`;
        }
        tableBody.innerHTML = rowsHTML;
    }

    function renderHistoryTable(base, payments) {
        const historyTable = document.getElementById('historyTable');
        let rowsHTML = '';
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);

        let balance = 0;
        let currentPeriod = '';

        for (let i = 0; i <= 365; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const date = getLocalDate(d);

            if (d.getDate() === SALARY_DAY) {
                balance = base;
                currentPeriod = date;
            }
            if (!currentPeriod) continue;

            const taken = payments[date] || 0;
            balance -= taken;

            if (taken > 0 || d.getDate() === SALARY_DAY) {
                rowsHTML += `
                    <tr>
                        <td>${date}</td>
                        <td class="money-cell">${formatMoney(taken)}</td>
                        <td class="money-cell">${formatMoney(balance)}</td>
                    </tr>`;
            }
        }
        historyTable.innerHTML = rowsHTML;
    }

    document.getElementById('saveSalary').onclick = async () => {
        showLoader();
        const value = +document.getElementById('baseSalary').value;
        await fetch('/api/saveSalary', {
            method: 'POST',
            body: JSON.stringify({ value })
        });
        await loadAllData(true);
    };

    window.updatePayment = async (date, amount) => {
        showLoader();
        await fetch('/api/savePayment', {
            method: 'POST',
            body: JSON.stringify({ date, amount: +amount })
        });
        await loadAllData(true);
    };

    document.getElementById('toggleHistory').onclick = () => {
        const historyBox = document.getElementById('historyBox');
        historyBox.classList.toggle('hidden');
        loadAllData();
    };

    document.getElementById('clearAllData').onclick = async () => {
        const pwd = prompt("Parol:");
        if (pwd === "Gamma#2025gamma") {
            if (confirm("Hamma ma'lumotni o'chirishni tasdiqlaysizmi?")) {
                showLoader();
                await fetch('/api/clearData', { method: 'POST' });
                location.reload();
            }
        } else { alert("Xato!"); }
    };

    loadAllData();
});