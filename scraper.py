import urllib.request
import xml.etree.ElementTree as ET
import json
import os
import datetime
import sys
from html import unescape

# Reconfigure stdout to UTF-8 on Windows to prevent UnicodeEncodeError in PowerShell
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Configured RSS feeds
FEEDS = {
    "BBC World News": {
        "url": "https://feeds.bbci.co.uk/news/world/rss.xml",
        "category": "World",
        "lang": "en"
    },
    "BBC 中文": {
        "url": "https://feeds.bbci.co.uk/zhongwen/simp/rss.xml",
        "category": "World",
        "lang": "zh"
    },
    "Hacker News": {
        "url": "https://news.ycombinator.com/rss",
        "category": "Tech",
        "lang": "en"
    }
}

def fetch_feed(name, config):
    print(f"Fetching {name}...")
    req = urllib.request.Request(
        config["url"], 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()
            return parse_rss(xml_data, name, config)
    except Exception as e:
        print(f"Error fetching {name}: {e}")
        return []

def parse_rss(xml_data, source_name, config):
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
            
            # Simple clean up of HTML tags in description if present
            if desc:
                # Strip simple tags
                import re
                desc = re.sub('<[^<]+?>', '', desc)
            
            articles.append({
                "title": title,
                "link": link,
                "description": desc,
                "pubDate": pub_date,
                "source": source_name,
                "category": config["category"],
                "lang": config["lang"]
            })
    except Exception as e:
        print(f"Error parsing RSS XML for {source_name}: {e}")
    return articles

def main():
    all_articles = []
    for name, config in FEEDS.items():
        articles = fetch_feed(name, config)
        print(f"Successfully scraped {len(articles)} articles from {name}.")
        all_articles.extend(articles)
        
    # Ensure data directory exists
    os.makedirs("data", exist_ok=True)
    
    # Save to JSON
    output_data = {
        "lastUpdated": datetime.datetime.now().isoformat(),
        "totalArticles": len(all_articles),
        "articles": all_articles
    }
    
    with open("data/news.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"Saved {len(all_articles)} news items to data/news.json.")

if __name__ == "__main__":
    main()
