// ===== SIDEBAR TOGGLE (MOBILE) =====
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('show');
});

sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
});

// ===== USER DROPDOWN =====
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');

userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
});

document.addEventListener('click', () => {
    userDropdown.classList.remove('show');
});

// ===== NAV ITEM ACTIVE STATE & PAGE SWITCHING =====
function switchPage(pageName) {
    // Toggle page visibility
    document.querySelectorAll('.dashboard-content[data-page]').forEach(page => {
        if (page.dataset.page === pageName) {
            page.classList.remove('page-hidden');
        } else {
            page.classList.add('page-hidden');
        }
    });

    // Update topbar subtitle
    const subtitles = {
        overview: "Here's what's happening with your portfolio today.",
        transactions: "View and manage your transaction history."
    };
    const subtitleEl = document.querySelector('.topbar-greeting p');
    if (subtitleEl && subtitles[pageName]) {
        subtitleEl.textContent = subtitles[pageName];
    }
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const page = item.dataset.page;
        if (page) switchPage(page);

        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('show');
        }
    });
});

// ===== CHART TABS =====
document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

// ===== TRADE TABS =====
const tradeTabs = document.querySelectorAll('.trade-tab');
const tradeBtn = document.querySelector('.trade-btn');

tradeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tradeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const action = tab.dataset.action;
        const labels = { buy: 'Buy Bitcoin', sell: 'Sell Bitcoin', swap: 'Swap Bitcoin' };
        tradeBtn.textContent = labels[action] || 'Buy Bitcoin';
    });
});

// ===== TRADE PRESETS =====
const presetBtns = document.querySelectorAll('.preset-btn');
const tradeInput = document.querySelector('.trade-input-wrap input');

presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const text = btn.textContent.replace('$', '').replace('K', '000');
        tradeInput.value = parseInt(text);
        updateTradeEstimate();
    });
});

tradeInput.addEventListener('input', updateTradeEstimate);

function updateTradeEstimate() {
    const amount = parseFloat(tradeInput.value) || 0;
    const btcPrice = 67842.30;
    const fee = amount * 0.0025;
    const btcAmount = amount / btcPrice;

    document.querySelector('.trade-receive').textContent = `≈ ${btcAmount.toFixed(5)} BTC`;
    document.querySelectorAll('.trade-summary-row')[1].querySelector('span:last-child').textContent =
        `$${fee.toFixed(2)} (0.25%)`;
    document.querySelector('.trade-summary-row.total span:last-child').textContent =
        `$${(amount + fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

// ===== TRADE FORM SUBMIT =====
document.getElementById('tradeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.querySelector('.trade-btn');
    const original = btn.textContent;

    btn.textContent = 'Processing...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    setTimeout(() => {
        btn.textContent = 'Order Placed!';
        btn.style.background = '#0cad56';
        btn.style.opacity = '1';

        setTimeout(() => {
            btn.textContent = original;
            btn.style.background = '';
            btn.disabled = false;
        }, 2000);
    }, 1500);
});

// ===== GREETING BASED ON TIME =====
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    else greeting = 'Good Evening';

    const h1 = document.querySelector('.topbar-greeting h1');
    h1.innerHTML = `${greeting}, <span>John</span>`;
}

updateGreeting();

// ===== TRANSACTIONS PAGE LOGIC =====
const TXN_PER_PAGE = 10;
let txnAllData = [];
let txnFiltered = [];
let txnCurrentPage = 1;
let txnCurrentFilter = 'all';

const iconMapTxn = { BTC: 'btc', ETH: 'eth', SOL: 'sol', ADA: 'ada', USDT: 'usdt', XRP: 'xrp', DOT: 'dot' };
const symbolMapTxn = { BTC: '₿', ETH: 'Ξ', SOL: '◎', ADA: '₳', USDT: '₮', XRP: '✕', DOT: '●' };

function renderTxnTable() {
    const tbody = document.getElementById('txnTableBody');
    const emptyState = document.getElementById('txnEmpty');
    const pagination = document.getElementById('txnPagination');
    if (!tbody) return;

    const start = (txnCurrentPage - 1) * TXN_PER_PAGE;
    const pageData = txnFiltered.slice(start, start + TXN_PER_PAGE);
    const totalPages = Math.max(1, Math.ceil(txnFiltered.length / TXN_PER_PAGE));

    if (txnFiltered.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        pagination.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    pagination.style.display = 'flex';

    tbody.innerHTML = pageData.map(tx => {
        const date = new Date(tx.created_at);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const iconCls = iconMapTxn[tx.asset_symbol] || 'default';
        const iconSym = symbolMapTxn[tx.asset_symbol] || (tx.asset_symbol ? tx.asset_symbol[0] : '$');
        const assetDisplay = tx.asset_name || tx.type;
        const symbolDisplay = tx.asset_symbol || '—';
        const amountDisplay = tx.amount ? `${Number(tx.amount).toLocaleString()} ${tx.asset_symbol || ''}` : '—';
        const amountClass = tx.type === 'buy' || tx.type === 'deposit' ? 'txn-amount-positive' : tx.type === 'sell' || tx.type === 'withdrawal' ? 'txn-amount-negative' : '';
        const priceDisplay = tx.price_per_unit ? '$' + Number(tx.price_per_unit).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—';
        const totalDisplay = '$' + Number(tx.total_usd).toLocaleString('en-US', { minimumFractionDigits: 2 });
        const feeDisplay = tx.fee_usd ? '$' + Number(tx.fee_usd).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '$0.00';
        const status = tx.status || 'completed';
        const statusLabel = status === 'on_hold' ? 'On Hold' : status;

        return `<tr>
            <td><span class="txn-type-badge ${tx.type}">${tx.type}</span></td>
            <td><div class="txn-asset-cell"><div class="txn-asset-icon ${iconCls}">${iconSym}</div><span>${assetDisplay}<br><small style="color:var(--text-lighter)">${symbolDisplay}</small></span></div></td>
            <td class="${amountClass}">${amountDisplay}</td>
            <td>${priceDisplay}</td>
            <td style="color:var(--white);font-weight:600">${totalDisplay}</td>
            <td>${feeDisplay}</td>
            <td><span class="txn-status ${status}"><span class="txn-status-dot"></span>${statusLabel}</span></td>
            <td>${dateStr}<br><small style="color:var(--text-lighter)">${timeStr}</small></td>
        </tr>`;
    }).join('');

    // Pagination controls
    document.getElementById('txnPageInfo').textContent = `Page ${txnCurrentPage} of ${totalPages}`;
    document.getElementById('txnPrevBtn').disabled = txnCurrentPage <= 1;
    document.getElementById('txnNextBtn').disabled = txnCurrentPage >= totalPages;
}

function updateTxnStats() {
    const total = txnAllData.length;
    const bought = txnAllData.filter(t => t.type === 'buy').reduce((s, t) => s + Number(t.total_usd || 0), 0);
    const sold = txnAllData.filter(t => t.type === 'sell').reduce((s, t) => s + Number(t.total_usd || 0), 0);
    const deposited = txnAllData.filter(t => t.type === 'deposit').reduce((s, t) => s + Number(t.total_usd || 0), 0);

    const fmt = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const el = id => document.getElementById(id);
    if (el('txnTotalCount')) el('txnTotalCount').textContent = total;
    if (el('txnTotalBought')) el('txnTotalBought').textContent = fmt(bought);
    if (el('txnTotalSold')) el('txnTotalSold').textContent = fmt(sold);
    if (el('txnTotalDeposited')) el('txnTotalDeposited').textContent = fmt(deposited);
}

function applyTxnFilter() {
    const searchVal = (document.getElementById('txnSearchInput')?.value || '').toLowerCase();
    txnFiltered = txnAllData.filter(tx => {
        const matchesFilter = txnCurrentFilter === 'all' || tx.type === txnCurrentFilter;
        const matchesSearch = !searchVal ||
            (tx.asset_name || '').toLowerCase().includes(searchVal) ||
            (tx.asset_symbol || '').toLowerCase().includes(searchVal) ||
            (tx.type || '').toLowerCase().includes(searchVal);
        return matchesFilter && matchesSearch;
    });
    txnCurrentPage = 1;
    renderTxnTable();
}

// Filter buttons
document.querySelectorAll('.txn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.txn-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        txnCurrentFilter = btn.dataset.filter;
        applyTxnFilter();
    });
});

// Search
const txnSearchInput = document.getElementById('txnSearchInput');
if (txnSearchInput) {
    txnSearchInput.addEventListener('input', () => applyTxnFilter());
}

// Pagination
const txnPrevBtn = document.getElementById('txnPrevBtn');
const txnNextBtn = document.getElementById('txnNextBtn');
if (txnPrevBtn) txnPrevBtn.addEventListener('click', () => { txnCurrentPage--; renderTxnTable(); });
if (txnNextBtn) txnNextBtn.addEventListener('click', () => { txnCurrentPage++; renderTxnTable(); });

// Export CSV
const txnExportBtn = document.getElementById('txnExportBtn');
if (txnExportBtn) {
    txnExportBtn.addEventListener('click', () => {
        if (txnFiltered.length === 0) return;
        const headers = ['Type', 'Asset', 'Symbol', 'Amount', 'Price per Unit', 'Total USD', 'Fee USD', 'Status', 'Date'];
        const rows = txnFiltered.map(tx => [
            tx.type,
            tx.asset_name || '',
            tx.asset_symbol || '',
            tx.amount || '',
            tx.price_per_unit || '',
            tx.total_usd,
            tx.fee_usd || 0,
            tx.status || 'completed',
            new Date(tx.created_at).toISOString()
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        a.click();
        URL.revokeObjectURL(url);
    });
}

// Called from the auth/data loading script to populate transactions page
function loadTransactionsPage(transactions) {
    txnAllData = transactions || [];
    txnFiltered = [...txnAllData];
    updateTxnStats();
    renderTxnTable();
}
