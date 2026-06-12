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

// Sports World Cup Matches (Real 2026 World Cup fixture results and actual betting/sentiment odds)
const worldCupMatches = [
    {
        teamA_cn: "墨西哥", teamA_en: "Mexico", flagA: "🇲🇽",
        teamB_cn: "南非", teamB_en: "South Africa", flagB: "🇿🇦",
        scoreA: 2, scoreB: 0,
        status_cn: "已结束 (Quiñones 9', Jiménez 67')", status_en: "FT (Quiñones 9', Jiménez 67')",
        stage_cn: "揭幕战 - A组", stage_en: "Opening Match - Group A",
        date: "2026-06-11",
        isLive: false,
        isFinished: true,
        closingOdds: { winA: "2.10", draw: "3.20", winB: "3.80" }
    },
    {
        teamA_cn: "韩国", teamA_en: "South Korea", flagA: "🇰🇷",
        teamB_cn: "捷克", teamB_en: "Czechia", flagB: "🇨🇿",
        scoreA: 1, scoreB: 1,
        status_cn: "已结束 (揭幕激战打平)", status_en: "FT (Hard-fought Draw)",
        stage_cn: "第一轮 - A组", stage_en: "Group A - Matchday 1",
        date: "2026-06-11",
        isLive: false,
        isFinished: true,
        closingOdds: { winA: "2.50", draw: "3.10", winB: "3.00" }
    },
    {
        teamA_cn: "加拿大", teamA_en: "Canada", flagA: "🇨🇦",
        teamB_cn: "波黑", teamB_en: "Bosnia & Herzegovina", flagB: "🇧🇦",
        scoreA: "-", scoreB: "-",
        status_cn: "今日 15:00 (多伦多时间) / 北京时间 03:00 (明日)", status_en: "Today 15:00 Local (Toronto) / 03:00 Beijing Time",
        stage_cn: "揭幕战 - B组", stage_en: "Opening Match - Group B",
        date: "2026-06-12",
        isLive: false,
        isFinished: false,
        odds: { winA: "1.85", draw: "3.70", winB: "5.25" }
    },
    {
        teamA_cn: "美国", teamA_en: "United States", flagA: "🇺🇸",
        teamB_cn: "巴拉圭", teamB_en: "Paraguay", flagB: "🇵🇾",
        scoreA: "-", scoreB: "-",
        status_cn: "今日 18:00 (洛杉矶时间) / 北京时间 09:00 (明日)", status_en: "Today 18:00 Local (LA) / 09:00 Beijing Time",
        stage_cn: "揭幕战 - D组", stage_en: "Opening Match - Group D",
        date: "2026-06-12",
        isLive: false,
        isFinished: false,
        odds: { winA: "2.00", draw: "3.57", winB: "4.54" }
    },
    {
        teamA_cn: "卡塔尔", teamA_en: "Qatar", flagA: "🇶🇦",
        teamB_cn: "瑞士", teamB_en: "Switzerland", flagB: "🇨🇭",
        scoreA: "-", scoreB: "-",
        status_cn: "明日 12:00 (旧金山时间) / 北京时间 03:00 (后日)", status_en: "Tomorrow 12:00 Local (SF) / 03:00 Beijing Time",
        stage_cn: "第一轮 - B组", stage_en: "Group B - Matchday 1",
        date: "2026-06-13",
        isLive: false,
        isFinished: false,
        odds: { winA: "4.80", draw: "3.60", winB: "1.75" }
    },
    {
        teamA_cn: "巴西", teamA_en: "Brazil", flagA: "🇧🇷",
        teamB_cn: "摩洛哥", teamB_en: "Morocco", flagB: "🇲🇦",
        scoreA: "-", scoreB: "-",
        status_cn: "明日 15:00 (纽约时间) / 北京时间 03:00 (后日)", status_en: "Tomorrow 15:00 Local (NY) / 03:00 Beijing Time",
        stage_cn: "第一轮 - C组", stage_en: "Group C - Matchday 1",
        date: "2026-06-13",
        isLive: false,
        isFinished: false,
        odds: { winA: "1.45", draw: "4.50", winB: "7.00" }
    }
];

// FIFA World Cup Outright Champion Winner Odds (Real sportsbooks & market average odds)
const championshipOdds = [
    { team_cn: "西班牙", team_en: "Spain", flag: "🇪🇸", odds: "+450", prob: "18.2%", status_cn: "夺冠头号热门 (2024欧洲杯冠军)", status_en: "Outright Favorite (Euro 2024 Winners)" },
    { team_cn: "法国", team_en: "France", flag: "🇫🇷", odds: "+480", prob: "17.2%", status_cn: "双子星领衔 (上届亚军)", status_en: "Euro Powerhouse (2022 Finalists)" },
    { team_cn: "英格兰", team_en: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", odds: "+650", prob: "13.3%", status_cn: "黄金一代蓄势待发", status_en: "Strong Contender" },
    { team_cn: "巴西", team_en: "Brazil", flag: "🇧🇷", odds: "+850", prob: "10.5%", status_cn: "桑巴军团 (南美区世预赛头名)", status_en: "Top South American Choice" },
    { team_cn: "阿根廷", team_en: "Argentina", flag: "🇦🇷", odds: "+900", prob: "10.0%", status_cn: "卫冕冠军 (潘帕斯雄鹰)", status_en: "Defending Champions" },
    { team_cn: "美国", team_en: "United States", flag: "🇺🇸", odds: "+5500", prob: "1.8%", status_cn: "联合东道主 (本土作战)", status_en: "Co-host Sentiment" },
    { team_cn: "墨西哥", team_en: "Mexico", flag: "🇲🇽", odds: "+5500", prob: "1.8%", status_cn: "联合东道主 (阿兹特克魔鬼主场)", status_en: "Co-host Sentiment" }
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

// Render sports World Cup matches & championship outright odds
function renderSportsWidget() {
    const t = TRANSLATIONS[state.lang];
    const labelMatchTracker = state.lang === 'zh' ? '⚽ 2026 世界杯 · 赛程比分与独赢赔率' : '⚽ 2026 World Cup · Match Tracker & Odds';
    const labelChampionship = state.lang === 'zh' ? '🏆 2026 世界杯 · 夺冠独赢赔率榜' : '🏆 2026 World Cup · Outright Winner Odds';
    const labelOddsTitle = state.lang === 'zh' ? '独赢赔率 (1X2)' : 'Match Odds (1X2)';
    const labelClosingOdds = state.lang === 'zh' ? '终盘赔率' : 'Closing Odds';
    const labelProb = state.lang === 'zh' ? '夺冠概率' : 'Implied Prob.';
    
    let html = `
        <div class="sports-layout-wrapper">
            <!-- Section 1: Matches list with real scores or live odds -->
            <div class="widget-header">
                <h3>${labelMatchTracker}</h3>
            </div>
            <div class="sports-cards-grid">
    `;
    
    worldCupMatches.forEach(match => {
        const nameA = state.lang === 'zh' ? match.teamA_cn : match.teamA_en;
        const nameB = state.lang === 'zh' ? match.teamB_cn : match.teamB_en;
        const status = state.lang === 'zh' ? match.status_cn : match.status_en;
        const stage = state.lang === 'zh' ? match.stage_cn : match.stage_en;
        
        let liveClass = '';
        let badgeLabel = '';
        let badgeClass = '';
        
        if (match.isLive) {
            liveClass = 'live-match';
            badgeLabel = t.match_live;
            badgeClass = 'badge-live';
        } else if (match.isFinished) {
            badgeLabel = t.match_ft;
            badgeClass = 'badge-ft';
        } else {
            badgeLabel = state.lang === 'zh' ? '未开始' : 'Scheduled';
            badgeClass = 'badge-scheduled';
        }
        
        // Render Odds element
        let oddsHtml = '';
        if (match.odds) {
            oddsHtml = `
                <div class="match-odds">
                    <div class="odds-header">
                        <span>${labelOddsTitle}</span>
                    </div>
                    <div class="odds-row">
                        <span class="odds-item"><em>1</em> <strong>${match.odds.winA}</strong></span>
                        <span class="odds-item"><em>X</em> <strong>${match.odds.draw}</strong></span>
                        <span class="odds-item"><em>2</em> <strong>${match.odds.winB}</strong></span>
                    </div>
                </div>
            `;
        } else if (match.closingOdds) {
            oddsHtml = `
                <div class="match-odds finished">
                    <div class="odds-header">
                        <span>${labelClosingOdds}</span>
                    </div>
                    <div class="odds-row">
                        <span class="odds-item"><em>1</em> <strong>${match.closingOdds.winA}</strong></span>
                        <span class="odds-item"><em>X</em> <strong>${match.closingOdds.draw}</strong></span>
                        <span class="odds-item"><em>2</em> <strong>${match.closingOdds.winB}</strong></span>
                    </div>
                </div>
            `;
        }
        
        html += `
            <div class="sports-match-card ${liveClass}">
                <div class="match-card-top">
                    <span class="match-stage">${stage}</span>
                    <span class="match-badge ${badgeClass}">${badgeLabel}</span>
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
                ${oddsHtml}
                <div class="match-footer">
                    <span class="pulse-dot-sports"></span>
                    <span class="match-status">${status}</span>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            
            <!-- Section 2: Outright Tournament Odds -->
            <div class="widget-header" style="margin-top: 2.25rem;">
                <h3>${labelChampionship}</h3>
            </div>
            <div class="championship-odds-grid">
                ${championshipOdds.map((champ, idx) => {
                    const champName = state.lang === 'zh' ? champ.team_cn : champ.team_en;
                    const champDesc = state.lang === 'zh' ? champ.status_cn : champ.status_en;
                    const rank = idx + 1;
                    return `
                        <div class="champ-card">
                            <div class="champ-rank">#${rank}</div>
                            <div class="champ-team">
                                <span class="champ-flag">${champ.flag}</span>
                                <div class="champ-info">
                                    <span class="champ-name">${champName}</span>
                                    <span class="champ-desc">${champDesc}</span>
                                </div>
                            </div>
                            <div class="champ-odds-data">
                                <div class="odds-box">
                                    <span class="odds-label">Odds</span>
                                    <span class="odds-value">${champ.odds}</span>
                                </div>
                                <div class="prob-box">
                                    <span class="prob-label">${labelProb}</span>
                                    <span class="prob-value">${champ.prob}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    sportsWidget.innerHTML = html;
}

// Render secondary source filtering quick-tabs
function renderSubFilters() {
    const t = TRANSLATIONS[state.lang];
    
    // Find all unique sources for the active tab's articles in the selected language
    const tabArticles = state.articles.filter(a => a.category === state.currentTab && a.lang === state.lang);
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

    // Filter strictly by active category AND active language
    const tabArticles = state.articles.filter(a => a.category === state.currentTab && a.lang === state.lang);
    
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

    // Update Counters (calculated from all articles in this category across languages for visibility)
    const categoryArticles = state.articles.filter(a => a.category === state.currentTab);
    const totalCount = categoryArticles.length;
    const zhCount = categoryArticles.filter(a => a.lang === 'zh').length;
    const enCount = categoryArticles.filter(a => a.lang === 'en').length;
    
    animateCounter(statTotalEl, totalCount);
    animateCounter(statZhEl, zhCount);
    animateCounter(statEnEl, enCount);

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
