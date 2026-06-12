// Application State
let state = {
    articles: [],
    lastUpdated: null,
    currentFilter: 'all',
    searchQuery: ''
};

// DOM Elements
const newsGrid = document.getElementById('news-grid');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const updateTimeEl = document.getElementById('update-time');
const statTotalEl = document.getElementById('stat-total');
const statZhEl = document.getElementById('stat-zh');
const statEnEl = document.getElementById('stat-en');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadNewsData();
    setupEventListeners();
});

// Fetch News JSON
async function loadNewsData() {
    try {
        const response = await fetch('data/news.json');
        if (!response.ok) {
            throw new Error('News file not found. Scraper may need to be run first!');
        }
        const data = await response.json();
        
        state.articles = data.articles || [];
        state.lastUpdated = data.lastUpdated;
        
        updateHeaderAndStats();
        renderNews();
    } catch (error) {
        console.error('Error loading news data:', error);
        renderErrorState();
    }
}

// Set up Filter & Search event listeners
function setupEventListeners() {
    // Search input typing
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderNews();
    });

    // Category filter button clicks
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.currentFilter = btn.getAttribute('data-filter');
            renderNews();
        });
    });
}

// Update Header timestamp and dashboard stats
function updateHeaderAndStats() {
    // Update header timestamp
    if (state.lastUpdated) {
        const date = new Date(state.lastUpdated);
        updateTimeEl.textContent = `最后更新：${date.toLocaleString()}`;
    } else {
        updateTimeEl.textContent = '暂无更新记录';
    }

    // Stats calculations
    const total = state.articles.length;
    const zh = state.articles.filter(a => a.lang === 'zh').length;
    const en = state.articles.filter(a => a.lang === 'en').length;

    animateCounter(statTotalEl, total);
    animateCounter(statZhEl, zh);
    animateCounter(statEnEl, en);
}

// Counter animation helper
function animateCounter(el, targetValue) {
    let start = 0;
    const duration = 800; // ms
    const stepTime = 15;
    const steps = duration / stepTime;
    const increment = targetValue / steps;
    
    if (targetValue === 0) {
        el.textContent = '0';
        return;
    }

    const timer = setInterval(() => {
        start += increment;
        if (start >= targetValue) {
            el.textContent = targetValue;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(start);
        }
    }, stepTime);
}

// Filter and Render News Grid
function renderNews() {
    // Clear Grid
    newsGrid.innerHTML = '';

    // Filter items
    const filteredArticles = state.articles.filter(item => {
        // Source Filter
        const matchesFilter = state.currentFilter === 'all' || item.source === state.currentFilter;
        
        // Search query filter
        const matchesSearch = !state.searchQuery || 
            item.title.toLowerCase().includes(state.searchQuery) || 
            item.description.toLowerCase().includes(state.searchQuery) ||
            item.source.toLowerCase().includes(state.searchQuery);
            
        return matchesFilter && matchesSearch;
    });

    if (filteredArticles.length === 0) {
        renderEmptyState();
        return;
    }

    // Generate News Cards
    filteredArticles.forEach(item => {
        const card = document.createElement('article');
        card.className = 'news-card';
        
        // Match specific class name for source style
        const sourceClass = item.source.toLowerCase().replace(/\s+/g, '-');
        
        // Format pubDate nicely
        let formattedDate = item.pubDate;
        try {
            if (item.pubDate) {
                const dateObj = new Date(item.pubDate);
                if (!isNaN(dateObj)) {
                    formattedDate = dateObj.toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            }
        } catch (e) {}

        card.innerHTML = `
            <div class="card-header">
                <span class="badge-source ${sourceClass}">${item.source}</span>
                <span class="card-date">${formattedDate}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-desc">${item.description || '无详细内容描述。'}</p>
            </div>
            <div class="card-footer">
                <a href="${item.link}" target="_blank" class="btn-read">
                    <span>阅读全文</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>
        `;
        newsGrid.appendChild(card);
    });
}

// Render Empty Results State
function renderEmptyState() {
    newsGrid.innerHTML = `
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h3>未找到相关新闻</h3>
            <p>试试其他搜索词或选择“全部新闻”选项卡。</p>
        </div>
    `;
}

// Render Error / Initialization instructions
function renderErrorState() {
    newsGrid.innerHTML = `
        <div class="empty-state" style="border-color: rgba(239, 68, 68, 0.3);">
            <svg style="color: #ef4444;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <h3 style="color: #ffffff;">尚未生成新闻数据</h3>
            <p style="margin-bottom: 1.5rem;">需要运行新闻抓取脚本来生成数据文件（data/news.json）。</p>
            <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.85rem; display: inline-block; text-align: left; border: 1px solid var(--border-color);">
                python scraper.py
            </div>
        </div>
    `;
    updateTimeEl.textContent = '未找到数据文件';
}
