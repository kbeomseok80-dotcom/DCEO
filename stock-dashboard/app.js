/**
 * StockInsight Core Logic
 */

// 1. Mock Data (Updated with real data from Google Finance)
const stocks = [
    { name: '삼성전자', code: '005930', price: 216500, change: -1000, pct: -0.46, vol: '12.4M' },
    { name: 'SK하이닉스', code: '000660', price: 1133000, change: 21124, pct: 1.90, vol: '3.1M' },
    { name: 'NAVER', code: '035420', price: 215500, change: 2912, pct: 1.37, vol: '0.9M' },
    { name: '카카오', code: '035720', price: 49925, change: -675, pct: -1.33, vol: '2.8M' },
    { name: '현대차', code: '005380', price: 537000, change: 3000, pct: 0.56, vol: '1.5M' },
    { name: '셀트리온', code: '068270', price: 207000, change: -2000, pct: -0.96, vol: '1.1M' }
];

let watchlist = JSON.parse(localStorage.getItem('stock_insight_watchlist') || '["005930", "035420"]');

// 2. Navigation
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar li').forEach(li => {
        const text = li.innerText;
        if ((id === 'dashboard' && text === '대시보드') || 
            (id === 'market' && text === '시장 현황') || 
            (id === 'watchlist' && text === '관심 종목')) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });
}

// 3. Search & Detail
function searchStock() {
    const query = document.getElementById('stock-search').value.toLowerCase();
    const found = stocks.find(s => s.name.toLowerCase().includes(query) || s.code.includes(query));
    
    if (found) {
        renderStockDetail(found);
    } else {
        alert('종목을 찾을 수 없습니다.');
    }
}

function renderStockDetail(stock) {
    showSection('stock-detail');
    document.getElementById('detail-name').innerText = stock.name;
    document.getElementById('detail-code').innerText = stock.code;
    document.getElementById('detail-price').innerText = stock.price.toLocaleString();
    
    const changeEl = document.getElementById('detail-change');
    const isUp = stock.change >= 0;
    changeEl.innerText = `${isUp ? '+' : ''}${stock.change.toLocaleString()} (${stock.pct}%)`;
    changeEl.className = `value ${isUp ? 'up' : 'down'}`;
    
    document.getElementById('detail-volume').innerText = stock.vol;

    // Init Detail Chart
    initMainChart(stock.name);
}

// 4. Watchlist Logic
function renderWatchlist() {
    const tbody = document.querySelector('#watchlist-table tbody');
    tbody.innerHTML = '';
    
    const items = stocks.filter(s => watchlist.includes(s.code));
    
    items.forEach(stock => {
        const isUp = stock.change >= 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${stock.name}</strong></td>
            <td>${stock.price.toLocaleString()}</td>
            <td class="${isUp ? 'up' : 'down'}">${isUp ? '▲' : '▼'} ${Math.abs(stock.change).toLocaleString()}</td>
            <td class="${isUp ? 'up' : 'down'}">${stock.pct}%</td>
        `;
        tr.style.cursor = 'pointer';
        tr.onclick = () => renderStockDetail(stock);
        tbody.appendChild(tr);
    });
}

// 5. Charts (Chart.js)
function initSparklines() {
    ['kospi', 'kosdaq', 'nasdaq'].forEach(id => {
        const ctx = document.getElementById(`chart-${id}`).getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(10).fill(''),
                datasets: [{
                    data: Array.from({length: 10}, () => Math.random() * 100),
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    });
}

let mainChart = null;
function initMainChart(name) {
    const ctx = document.getElementById('stock-main-chart').getContext('2d');
    if (mainChart) mainChart.destroy();
    
    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '15:30'],
            datasets: [{
                label: name,
                data: Array.from({length: 8}, () => Math.floor(Math.random() * 5000) + 80000),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#e2e8f0' } } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#2d3748' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#2d3748' } }
            }
        }
    });
}

// 6. Theme & Utils
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    // 실제 운영 시엔 색상 변수나 로컬 스토리지 저장 로직 추가
}

function updateTime() {
    const now = new Date();
    document.getElementById('current-time').innerText = now.toLocaleString('ko-KR');
}

// 7. Initialize
window.onload = () => {
    updateTime();
    setInterval(updateTime, 1000);
    initSparklines();
    renderWatchlist();
    
    // 시뮬레이션: 5초마다 데이터 미세 변동
    setInterval(() => {
        stocks.forEach(s => {
            const move = (Math.random() - 0.5) * 500;
            s.price += Math.floor(move);
        });
        renderWatchlist();
    }, 5000);
};
