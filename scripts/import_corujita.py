#!/usr/bin/env python3
"""Import story text from Corujita pages into a local static JS data file."""
from __future__ import annotations

import html
import json
import re
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://corujita.com.br"
SITEMAP = f"{BASE}/sitemap.xml"
DEST = ROOT / "stories-data.js"
EXCLUDED = {
    "", "categorias", "populares", "ebook", "sobre-nos",
    "politica-de-privacidade", "politicas-de-cookies",
    "contos-classicos", "historinha-para-dormir", "historinhas-biblicas",
    "historinhas-curtas", "historinhas-de-animais", "historinhas-de-aventura",
    "historinhas-de-dinossauros", "historinhas-de-natal", "historinhas-de-princesa",
}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "SonhosDaMary/1.0 (static story import)"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=25) as response:
                return response.read()
        except (urllib.error.URLError, TimeoutError) as exc:
            if attempt == 3:
                raise
            print(f"Retry {attempt + 1}: {url} ({exc})", file=sys.stderr)
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Failed to fetch {url}")


class StoryParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.in_article_json = False
        self.json_parts: list[str] = []
        self.json_blocks: list[str] = []
        self.in_reading = False
        self.reading_depth = 0
        self.block: str | None = None
        self.block_parts: list[str] = []
        self.paragraphs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_map = dict(attrs)
        if tag == "script" and attrs_map.get("type") == "application/ld+json":
            self.in_article_json = True
            self.json_parts = []
        if tag == "div" and attrs_map.get("data-reading-content") == "true":
            self.in_reading = True
            self.reading_depth = 1
            return
        if self.in_reading:
            if tag == "div":
                self.reading_depth += 1
            if tag in {"p", "h2", "h3", "li", "blockquote"}:
                self.block = tag
                self.block_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self.in_article_json:
            self.in_article_json = False
            self.json_blocks.append("".join(self.json_parts))
        if self.in_reading:
            if tag in {"p", "h2", "h3", "li", "blockquote"} and self.block == tag:
                text = re.sub(r"\s+", " ", "".join(self.block_parts)).strip()
                if text:
                    self.paragraphs.append(text)
                self.block = None
                self.block_parts = []
            if tag == "div":
                self.reading_depth -= 1
                if self.reading_depth <= 0:
                    self.in_reading = False

    def handle_data(self, data: str) -> None:
        if self.in_article_json:
            self.json_parts.append(data)
        if self.in_reading and self.block:
            self.block_parts.append(data)


def image_url(value: object) -> str:
    if isinstance(value, dict):
        value = value.get("url", "")
    if not isinstance(value, str) or not value:
        return ""
    if value.startswith("/"):
        return BASE + value
    return value


def story_from_url(url: str) -> dict:
    parser = StoryParser()
    parser.feed(fetch(url).decode("utf-8", errors="replace"))
    metadata: dict = {}
    for block in parser.json_blocks:
        try:
            value = json.loads(block)
            if isinstance(value, dict) and value.get("@type") == "Article":
                metadata = value
                break
        except json.JSONDecodeError:
            continue
    if not metadata:
        raise ValueError(f"Article metadata not found: {url}")
    title = html.unescape(str(metadata.get("headline") or urlparse(url).path.strip("/").replace("-", " ").title()))
    category = html.unescape(str(metadata.get("articleSection") or "Histórias"))
    description = html.unescape(str(metadata.get("description") or "Uma historinha para sonhar."))
    word_count = int(metadata.get("wordCount") or 0)
    minutes = max(1, round(word_count / 200)) if word_count else max(1, round(sum(map(len, parser.paragraphs)) / 1000))
    return {
        "id": urlparse(url).path.strip("/").lower(),
        "title": title,
        "category": category,
        "minutes": minutes,
        "desc": description,
        "image": image_url(metadata.get("image")),
        "body": parser.paragraphs,
        "source": metadata.get("url", url),
    }


def main() -> None:
    xml = ET.fromstring(fetch(SITEMAP))
    urls = [element.text or "" for element in xml.iter() if element.tag.endswith("loc")]
    article_urls = []
    for url in urls:
        path = urlparse(url).path.strip("/").lower()
        if path not in EXCLUDED and path and "/" not in path:
            article_urls.append(url.rstrip("/") + "/")

    print(f"Found {len(article_urls)} story pages in the sitemap.", flush=True)
    stories = []
    failed: list[str] = []
    for index, url in enumerate(article_urls, start=1):
        try:
            story = story_from_url(url)
            if not story["body"]:
                raise ValueError("Reading text was empty")
            stories.append(story)
            print(f"[{index}/{len(article_urls)}] {story['title']}", flush=True)
        except Exception as exc:  # keep importing other entries if one page is unavailable
            failed.append(url)
            print(f"Failed {url}: {exc}", file=sys.stderr, flush=True)
        time.sleep(0.12)

    stories.sort(key=lambda story: story["title"].casefold())
    js = "window.STORIES = " + json.dumps(stories, ensure_ascii=False, separators=(",", ":")) + ";\n"
    DEST.write_text(js, encoding="utf-8")
    print(f"Saved {len(stories)} stories to {DEST}", flush=True)
    if failed:
        print(f"Failed pages ({len(failed)}):", file=sys.stderr)
        print("\n".join(failed), file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
