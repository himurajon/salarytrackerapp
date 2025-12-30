document.addEventListener('DOMContentLoaded', () => {
    const SALARY_DAY = 12;
    const formatMoney = (num) => new Intl.NumberFormat('uz-UZ').format(num);

    const getLocalDate = (d) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 10);
    };

    // Ma'lumotlarni serverdan yuklash
    async function loadAllData() {
        tableBody.innerHTML = '<tr><td colspan="3">Yuklanmoqda...</td></tr>';
        const res = await fetch('/api/loadData');
        const { base, payments } = await res.json();

        baseSalary.value = base;
        renderTables(base, payments);
    }

    function renderTables(base, payments) {
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

    // Saqlash funksiyalari (API orqali)
    saveSalary.onclick = async () => {
        const value = +baseSalary.value;
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

    // Boshlang'ich yuklash
    loadAllData();
});