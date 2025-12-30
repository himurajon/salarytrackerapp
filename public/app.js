document.addEventListener('DOMContentLoaded', () => {
    const SALARY_DAY = 12;
    const formatMoney = (num) => new Intl.NumberFormat('uz-UZ').format(num);

    const getLocalDate = (d) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 10);
    };

    async function loadAllData() {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '<tr><td colspan="3">Yuklanmoqda...</td></tr>';
        
        try {
            const res = await fetch('/api/loadData');
            const { base, payments } = await res.json();

            document.getElementById('baseSalary').value = base;
            renderMainTable(base, payments);
            
            if (!document.getElementById('historyBox').classList.contains('hidden')) {
                renderHistoryTable(base, payments);
            }
        } catch (err) {
            tableBody.innerHTML = '<tr><td colspan="3" style="color:red">Xato yuz berdi!</td></tr>';
        }
    }

    function renderMainTable(base, payments) {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';
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
            tableBody.insertAdjacentHTML('beforeend', `
                <tr class="${isToday ? 'today-row' : ''}">
                    <td class="readonly">${isToday ? `<b>${date}</b>` : date}</td>
                    <td>
                        <input type="number" value="${taken}" 
                               onchange="updatePayment('${date}', this.value)">
                    </td>
                    <td class="readonly money-cell">${formatMoney(balance)}</td>
                </tr>
            `);
        }
    }

    function renderHistoryTable(base, payments) {
        const historyTable = document.getElementById('historyTable');
        historyTable.innerHTML = '';
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
                historyTable.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td>${date}</td>
                        <td class="money-cell">${formatMoney(taken)}</td>
                        <td class="money-cell">${formatMoney(balance)}</td>
                    </tr>
                `);
            }
        }
    }

    document.getElementById('saveSalary').onclick = async () => {
        const value = +document.getElementById('baseSalary').value;
        await fetch('/api/saveSalary', {
            method: 'POST',
            body: JSON.stringify({ value })
        });
        loadAllData();
    };

    window.updatePayment = async (date, amount) => {
        await fetch('/api/savePayment', {
            method: 'POST',
            body: JSON.stringify({ date, amount: +amount })
        });
        loadAllData();
    };

    document.getElementById('toggleHistory').onclick = () => {
        const historyBox = document.getElementById('historyBox');
        historyBox.classList.toggle('hidden');
        loadAllData();
    };

    document.getElementById('clearAllData').onclick = async () => {
        const pwd = prompt("Xavfsizlik paroli:");
        if (pwd === "Gamma#2025gamma") {
            if (confirm("Barcha ma'lumotlarni o'chirishga ishonchingiz komilmi?")) {
                const res = await fetch('/api/clearData', { method: 'POST' });
                if (res.ok) location.reload();
            }
        } else {
            alert("Parol noto'g'ri!");
        }
    };

    loadAllData();
});