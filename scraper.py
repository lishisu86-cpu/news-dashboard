import urllib.request
import xml.etree.ElementTree as ET
import json
import os
import datetime
import sys
import re
from html import unescape

# Reconfigure stdout to UTF-8 on Windows to prevent UnicodeEncodeError in PowerShell
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Categories and their respective RSS feeds
FEEDS = {
    "finance": {
        "BBC Business (EN)": {
            "url": "https://feeds.bbci.co.uk/news/business/rss.xml",
            "lang": "en"
        },
        "RTHK 财经 (ZH)": {
            "url": "https://rthk.hk/rthk/news/rss/c_expressnews_cfinance.xml",
            "lang": "zh"
        }
    },
    "sports": {
        "BBC Sports Football (EN)": {
            "url": "https://feeds.bbci.co.uk/sport/football/rss.xml",
            "lang": "en"
        },
        "RTHK 体育 (ZH)": {
            "url": "https://rthk.hk/rthk/news/rss/c_expressnews_csport.xml",
            "lang": "zh"
        }
    },
    "tech": {
        "Hacker News (EN)": {
            "url": "https://news.ycombinator.com/rss",
            "lang": "en"
        },
        "Solidot (ZH)": {
            "url": "https://www.solidot.org/index.rss",
            "lang": "zh"
        }
    },
    "entertainment": {
        "BBC Entertainment (EN)": {
            "url": "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
            "lang": "en"
        },
        "BBC 娱乐 (ZH)": {
            "url": "https://feeds.bbci.co.uk/zhongwen/simp/rss.xml", # Falls back to general BBC Chinese feed which has plenty of cultural news
            "lang": "zh"
        }
    }
}

# Financial assets to track from Yahoo Finance API
MARKET_TICKERS = {
    "SP500": {
        "symbol": "^GSPC",
        "name_cn": "标普 500 指数",
        "name_en": "S&P 500"
    },
    "NASDAQ": {
        "symbol": "^IXIC",
        "name_cn": "纳斯达克综合指数",
        "name_en": "Nasdaq Composite"
    },
    "GOLD": {
        "symbol": "GC=F",
        "name_cn": "黄金期货 (COMEX)",
        "name_en": "Gold Futures"
    },
    "BTC": {
        "symbol": "BTC-USD",
        "name_cn": "比特币 (USD)",
        "name_en": "Bitcoin"
    }
}

def fetch_market_data():
    print("Fetching market ticker data from Yahoo Finance...")
    market_data = []
    
    for key, info in MARKET_TICKERS.items():
        symbol = info["symbol"]
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1d"
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
        )
        
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode('utf-8'))
                result = data.get("chart", {}).get("result", [None])[0]
                if not result:
                    continue
                    
                meta = result.get("meta", {})
                price = meta.get("regularMarketPrice")
                prev_close = meta.get("chartPreviousClose")
                
                # Sometime previous close might not be direct in chartPreviousClose, fallback to previousClose
                if prev_close is None:
                    prev_close = meta.get("previousClose")
                
                if price is not None:
                    # If prev_close is missing, default to regularMarketPrice to show 0% change
                    if prev_close is None:
                        prev_close = price
                        
                    change = price - prev_close
                    change_percent = (change / prev_close) * 100 if prev_close != 0 else 0
                    
                    market_data.append({
                        "key": key,
                        "symbol": symbol,
                        "name_cn": info["name_cn"],
                        "name_en": info["name_en"],
                        "price": round(price, 2),
                        "change": round(change, 2),
                        "changePercent": round(change_percent, 2)
                    })
                    print(f"Successfully fetched {key}: {price} ({change_percent:+.2f}%)")
                else:
                    print(f"Warning: price for {key} is None")
        except Exception as e:
            print(f"Error fetching ticker {key} ({symbol}): {e}")
            
    return market_data

def fetch_feed(category, source_name, config):
    print(f"Fetching {category} -> {source_name}...")
    req = urllib.request.Request(
        config["url"], 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()
            return parse_rss(xml_data, source_name, category, config)
    except Exception as e:
        print(f"Error fetching {source_name}: {e}")
        return []

def parse_rss(xml_data, source_name, category, config):
    articles = []
    try:
        root = ET.fromstring(xml_data)
        channel = root.find('channel')
        if channel is None:
            return articles
            
        items = channel.findall('item')
        for item in items:
            title_node = item.find('title')
            link_node = item.find('link')
            desc_node = item.find('description')
            date_node = item.find('pubDate')
            
            title = unescape(title_node.text) if title_node is not None and title_node.text else "No Title"
            link = link_node.text if link_node is not None and link_node.text else "#"
            desc = unescape(desc_node.text) if desc_node is not None and desc_node.text else ""
            pub_date = date_node.text if date_node is not None and date_node.text else ""
            
            # Clean up HTML tags in description
            if desc:
                desc = re.sub('<[^<]+?>', '', desc)
                desc = desc.replace("\n", " ").strip()
            
            articles.append({
                "title": title,
                "link": link,
                "description": desc,
                "pubDate": pub_date,
                "source": source_name,
                "category": category, # e.g. finance, sports, tech, entertainment
                "lang": config["lang"]
            })
    except Exception as e:
        print(f"Error parsing RSS XML for {source_name}: {e}")
    return articles

def main():
    # Fetch Market Tick Data
    market_data = fetch_market_data()
    
    # Fetch Categorized RSS Feeds
    all_articles = []
    for category, sources in FEEDS.items():
        for source_name, config in sources.items():
            articles = fetch_feed(category, source_name, config)
            print(f"Successfully scraped {len(articles)} articles from {source_name}.")
            all_articles.extend(articles)
            
    # Ensure data directory exists
    os.makedirs("data", exist_ok=True)
    
    # Save to JSON
    output_data = {
        "lastUpdated": datetime.datetime.now().isoformat(),
        "totalArticles": len(all_articles),
        "marketData": market_data,
        "articles": all_articles
    }
    
    with open("data/news.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"Saved {len(all_articles)} news items and {len(market_data)} market tickers to data/news.json.")

if __name__ == "__main__":
    main()
