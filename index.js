// Application State
let state = {
    articles: [],
    marketData: [],
    lastUpdated: null,
    currentTab: 'finance', // finance, sports, tech, entertainment
    currentFilter: 'all',  // sub-filter (sources)
    searchQuery: '',
    lang: 'zh'            // zh (Chinese), en (English)
};

// Translations Dictionary
const TRANSLATIONS = {
    zh: {
        page_title: "AI 助理 - 每日新闻综合看板",
        logo_title: "Antigravity 每日看板",
        logo_sub: "您的智能 AI 助理每日精心整理的数据与资讯",
        loading_data: "正在载入新闻数据...",
        last_updated: "最后更新：",
        no_update_record: "暂无更新记录",
        search_placeholder: "搜索文章标题、关键词或来源...",
        tab_finance: "投资金融",
        tab_sports: "世界杯体育",
        tab_tech: "科技前沿",
        tab_entertainment: "娱乐生活",
        lbl_stat_total: "本板块文章数",
        lbl_stat_zh: "中文报道",
        lbl_stat_en: "英文报道",
        btn_read_more: "阅读全文",
        empty_state_title: "未找到相关新闻",
        empty_state_desc: "试着输入其他关键词，或者点击“全部”过滤标签。",
        error_state_title: "未找到新闻数据",
        error_state_desc: "请先运行 scraper.py 抓取脚本，生成相应的数据文件（data/news.json）。",
        footer_text: "本站由 <strong>Antigravity AI</strong> 智能全自动编写与运维发布。",
        sub_filter_all: "全部来源",
        market_title: "全球核心资产市场行情",
        sports_title: "2026 美加墨世界杯 — 热点赛程比分牌",
        match_live: "进行中",
        match_ft: "已结束"
    },
    en: {
        page_title: "AI Coworker - Daily News Hub",
        logo_title: "Antigravity News Hub",
        logo_sub: "Your intelligent coworker's curated daily data & reports",
        loading_data: "Loading live news feed...",
        last_updated: "Last Updated: ",
        no_update_record: "No update records found",
        search_placeholder: "Search headlines, keywords, or sources...",
        tab_finance: "Investment & Finance",
        tab_sports: "World Cup Sports",
        tab_tech: "Tech Front",
        tab_entertainment: "Pop Culture & Entertainment",
        lbl_stat_total: "Section Articles",
        lbl_stat_zh: "Chinese Articles",
        lbl_stat_en: "English Articles",
        btn_read_more: "Read Article",
        empty_state_title: "No Articles Found",
        empty_state_desc: "Try searching other terms or selecting a different source filter.",
        error_state_title: "No News Data Generated",
        error_state_desc: "You need to run scraper.py first to generate the data file (data/news.json).",
        footer_text: "Built autonomously by <strong>Antigravity AI</strong> — Your ultimate coding & operational partner.",
        sub_filter_all: "All Sources",
        market_title: "Global Financial Assets Live Tickers",
        sports_title: "2026 FIFA World Cup — Live Match Scoreboard",
        match_live: "Live",
        match_ft: "FT"
    }
};

// Sports World Cup Matches (Simulated live scoreboard for premium visual effect)
const worldCupMatches = [
    {
        teamA_cn: "阿根廷", teamA_en: "Argentina", flagA: "🇦🇷",
        teamB_cn: "法国", teamB_en: "France", flagB: "🇫🇷",
        scoreA: 3, scoreB: 3,
        status_cn: "点球大战 (4-2)", status_en: "FT (Pens 4-2)",
        stage_cn: "世界杯总决赛", stage_en: "World Cup Final",
        isLive: false
    },
    {
        teamA_cn: "巴西", teamA_en: "Brazil", flagA: "🇧🇷",
        teamB_cn: "西班牙", teamB_en: "Spain", flagB: "🇪🇸",
        scoreA: 1, scoreB: 1,
        status_cn: "下半场 75'", status_en: "75' 2nd Half",
        stage_cn: "半决赛强强对话", stage_en: "Semi-Final",
        isLive: true
    },
    {
        teamA_cn: "英格兰", teamA_en: "England", flagA: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        teamB_cn: "葡萄牙", teamB_en: "Portugal", flagB: "🇵🇹",
        scoreA: 2, scoreB: 0,
        status_cn: "已结束", status_en: "FT",
        stage_cn: "四分之一决赛", stage_en: "Quarter-Final",
        isLive: false
    }
];

// DOM Elements
const newsGrid = document.getElementById('news-grid');
const searchInput = document.getElementById('search-input');
const tabButtons = document.querySelectorAll('.tab-btn');
const subFiltersContainer = document.getElementById('sub-filters');
const updateTimeEl = document.getElementById('update-time');
const statTotalEl = document.getElementById('stat-total');
const statZhEl = document.getElementById('stat-zh');
const statEnEl = document.getElementById('stat-en');
const langBtn = document.getElementById('lang-btn');
const langLabel = document.getElementById('lang-label');

const marketWidget = document.getElementById('market-widget');
const sportsWidget = document.getElementById('sports-widget');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadNewsData();
    setupEventListeners();
});

// Load News & Market Data from relative data/news.json
async function loadNewsData() {
    try {
        const response = await fetch('data/news.json');
        if (!response.ok) {
            throw new Error('news.json not found');
        }
        const data = await response.json();
        
        state.articles = data.articles || [];
        state.marketData = data.marketData || [];
        state.lastUpdated = data.lastUpdated;
        
        applyTranslations();
        renderActiveTab();
    } catch (error) {
        console.error('Error loading news:', error);
        renderErrorState();
    }
}

// Set up UI Event Listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderNewsGrid();
    });

    // Tab Button Navigation Clicks
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.currentTab = btn.getAttribute('data-tab');
            state.currentFilter = 'all'; // Reset sub-filter on tab change
            state.searchQuery = '';      // Reset search
            searchInput.value = '';
            
            renderActiveTab();
        });
    });

    // Language Toggle Button Click
    langBtn.addEventListener('click', () => {
        state.lang = state.lang === 'zh' ? 'en' : 'zh';
        langLabel.textContent = state.lang === 'zh' ? 'English' : '中文';
        
        applyTranslations();
        renderActiveTab();
    });
}

// Translate all UI text dynamically
function applyTranslations() {
    const t = TRANSLATIONS[state.lang];
    
    // Header Logo texts
    document.getElementById('logo-title').textContent = t.logo_title;
    document.getElementById('logo-sub').textContent = t.logo_sub;
    
    // Header Timestamp
    if (state.lastUpdated) {
        const date = new Date(state.lastUpdated);
        updateTimeEl.textContent = `${t.last_updated}${date.toLocaleString()}`;
    } else {
        updateTimeEl.textContent = t.no_update_record;
    }
    
    // Navigation Tabs translation
    document.getElementById('tab-finance-label').textContent = t.tab_finance;
    document.getElementById('tab-sports-label').textContent = t.tab_sports;
    document.getElementById('tab-tech-label').textContent = t.tab_tech;
    document.getElementById('tab-entertainment-label').textContent = t.tab_entertainment;
    
    // Search box placeholder
    searchInput.placeholder = t.search_placeholder;
    
    // Stats labels
    document.getElementById('lbl-stat-total').textContent = t.lbl_stat_total;
    document.getElementById('lbl-stat-zh').textContent = t.lbl_stat_zh;
    document.getElementById('lbl-stat-en').textContent = t.lbl_stat_en;
    
    // Footer text
    document.getElementById('footer-text').innerHTML = t.footer_text;
}

// Render everything related to the current tab
function renderActiveTab() {
    // 1. Manage widget containers visibility
    if (state.currentTab === 'finance') {
        marketWidget.style.display = 'grid';
        sportsWidget.style.display = 'none';
        renderMarketWidget();
    } else if (state.currentTab === 'sports') {
        marketWidget.style.display = 'none';
        sportsWidget.style.display = 'grid';
        renderSportsWidget();
    } else {
        marketWidget.style.display = 'none';
        sportsWidget.style.display = 'none';
    }

    // 2. Render sub-filters (sources) for active tab
    renderSubFilters();

    // 3. Render news grid articles
    renderNewsGrid();
}

// Render financial rates tickers
function renderMarketWidget() {
    const t = TRANSLATIONS[state.lang];
    marketWidget.innerHTML = `
        <div class="widget-header">
            <h3>${t.market_title}</h3>
        </div>
        <div class="market-cards-grid">
            ${state.marketData.map(item => {
                const isUp = item.change >= 0;
                const trendClass = isUp ? 'trend-up' : 'trend-down';
                const sign = isUp ? '+' : '';
                const name = state.lang === 'zh' ? item.name_cn : item.name_en;
                
                return `
                    <div class="market-card ${trendClass}">
                        <div class="market-card-top">
                            <span class="market-name">${name}</span>
                            <span class="market-symbol">${item.symbol}</span>
                        </div>
                        <div class="market-price-area">
                            <span class="market-price">$${item.price.toLocaleString()}</span>
                            <span class="market-badge">${sign}${item.changePercent}%</span>
                        </div>
                        <div class="market-indicator">
                            <span class="indicator-dot"></span>
                            <span class="indicator-text">${sign}${item.change.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Render sports World Cup matches
function renderSportsWidget() {
    const t = TRANSLATIONS[state.lang];
    sportsWidget.innerHTML = `
        <div class="widget-header">
            <h3>${t.sports_title}</h3>
        </div>
        <div class="sports-cards-grid">
            ${worldCupMatches.map(match => {
                const nameA = state.lang === 'zh' ? match.teamA_cn : match.teamA_en;
                const nameB = state.lang === 'zh' ? match.teamB_cn : match.teamB_en;
                const status = state.lang === 'zh' ? match.status_cn : match.status_en;
                const stage = state.lang === 'zh' ? match.stage_cn : match.stage_en;
                const liveClass = match.isLive ? 'live-match' : '';
                const badgeLabel = match.isLive ? t.match_live : t.match_ft;
                
                return `
                    <div class="sports-match-card ${liveClass}">
                        <div class="match-card-top">
                            <span class="match-stage">${stage}</span>
                            <span class="match-badge">${badgeLabel}</span>
                        </div>
                        <div class="match-scoreboard">
                            <div class="team-side">
                                <span class="team-flag">${match.flagA}</span>
                                <span class="team-name">${nameA}</span>
                            </div>
                            <div class="match-score">
                                <span>${match.scoreA}</span>
                                <span class="score-divider">:</span>
                                <span>${match.scoreB}</span>
                            </div>
                            <div class="team-side text-right">
                                <span class="team-name">${nameB}</span>
                                <span class="team-flag">${match.flagB}</span>
                            </div>
                        </div>
                        <div class="match-footer">
                            <span class="pulse-dot-sports"></span>
                            <span class="match-status">${status}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Render secondary source filtering quick-tabs
function renderSubFilters() {
    const t = TRANSLATIONS[state.lang];
    
    // Find all unique sources for the active tab's articles
    const tabArticles = state.articles.filter(a => a.category === state.currentTab);
    const uniqueSources = ['all', ...new Set(tabArticles.map(a => a.source))];
    
    subFiltersContainer.innerHTML = uniqueSources.map(src => {
        const isActive = state.currentFilter === src ? 'active' : '';
        const label = src === 'all' ? t.sub_filter_all : src;
        return `
            <button class="filter-btn ${isActive}" data-src="${src}">${label}</button>
        `;
    }).join('');

    // Add click listeners to sub-filters
    const subFilterButtons = subFiltersContainer.querySelectorAll('.filter-btn');
    subFilterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            subFilterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilter = btn.getAttribute('data-src');
            renderNewsGrid();
        });
    });
}

// Render main news articles grid & animate counters
function renderNewsGrid() {
    const t = TRANSLATIONS[state.lang];
    newsGrid.innerHTML = '';

    // Filter by tab, sub-filter source, and search query
    const tabArticles = state.articles.filter(a => a.category === state.currentTab);
    
    const filteredArticles = tabArticles.filter(item => {
        // Source sub-filter
        const matchesFilter = state.currentFilter === 'all' || item.source === state.currentFilter;
        
        // Search text box
        const matchesSearch = !state.searchQuery || 
            item.title.toLowerCase().includes(state.searchQuery) || 
            item.description.toLowerCase().includes(state.searchQuery) ||
            item.source.toLowerCase().includes(state.searchQuery);
            
        return matchesFilter && matchesSearch;
    });

    // Update Counters
    const total = filteredArticles.length;
    const zh = filteredArticles.filter(a => a.lang === 'zh').length;
    const en = filteredArticles.filter(a => a.lang === 'en').length;
    
    animateCounter(statTotalEl, total);
    animateCounter(statZhEl, zh);
    animateCounter(statEnEl, en);

    if (filteredArticles.length === 0) {
        renderEmptyState();
        return;
    }

    // Append articles cards
    filteredArticles.forEach(item => {
        const card = document.createElement('article');
        card.className = 'news-card';
        
        // Format source text
        const sourceClass = item.source.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
        
        // Format date string beautifully
        let formattedDate = item.pubDate;
        try {
            if (item.pubDate) {
                const dateObj = new Date(item.pubDate);
                if (!isNaN(dateObj)) {
                    formattedDate = dateObj.toLocaleDateString(state.lang === 'zh' ? 'zh-CN' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            }
        } catch (e) {}

        const desc = item.description || (state.lang === 'zh' ? '无详细内容描述。' : 'No description available.');

        card.innerHTML = `
            <div class="card-header">
                <span class="badge-source ${sourceClass}">${item.source}</span>
                <span class="card-date">${formattedDate}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-desc">${desc}</p>
            </div>
            <div class="card-footer">
                <a href="${item.link}" target="_blank" class="btn-read">
                    <span>${t.btn_read_more}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>
        `;
        newsGrid.appendChild(card);
    });
}

// Animate numbers
function animateCounter(el, targetValue) {
    let start = 0;
    const duration = 600; // ms
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

// Render Empty news search result
function renderEmptyState() {
    const t = TRANSLATIONS[state.lang];
    newsGrid.innerHTML = `
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h3>${t.empty_state_title}</h3>
            <p>${t.empty_state_desc}</p>
        </div>
    `;
}

// Render Error / Initialization instructions
function renderErrorState() {
    // Determine language fallback
    const lang = TRANSLATIONS[state.lang] ? state.lang : 'zh';
    const t = TRANSLATIONS[lang];
    
    newsGrid.innerHTML = `
        <div class="empty-state" style="border-color: rgba(239, 68, 68, 0.3);">
            <svg style="color: #ef4444;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <h3 style="color: #ffffff;">${t.error_state_title}</h3>
            <p style="margin-bottom: 1.5rem;">${t.error_state_desc}</p>
            <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.85rem; display: inline-block; text-align: left; border: 1px solid var(--border-color);">
                python scraper.py
            </div>
        </div>
    `;
    updateTimeEl.textContent = t.no_update_record;
}
