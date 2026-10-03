#!/usr/bin/env python3
"""Validate the curated public sitemap and its static HTML metadata (stdlib only)."""
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://analyzershub.com"


class Metadata(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.head = False
        self.canonicals = []
        self.meta = {}
        self.schemas = []
        self.schema = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "head":
            self.head = True
        if not self.head:
            return
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs["href"])
        if tag == "meta":
            self.meta[attrs.get("name", attrs.get("property"))] = attrs.get("content", "")
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.schema = ""

    def handle_data(self, data):
        if self.schema is not None:
            self.schema += data

    def handle_endtag(self, tag):
        if tag == "script" and self.schema is not None:
            self.schemas.append(json.loads(self.schema))
            self.schema = None
        if tag == "head":
            self.head = False


def main():
    assert (ROOT / "CNAME").read_text().strip() == "analyzershub.com"
    robots = RobotFileParser()
    robots.parse((ROOT / "robots.txt").read_text().splitlines())
    assert robots.site_maps() == [ORIGIN + "/sitemap.xml"]
    tree = ET.parse(ROOT / "sitemap.xml")
    urls = [node.text for node in tree.findall("{*}url/{*}loc")]
    assert urls and len(urls) == len(set(urls))
    for url in urls:
        parsed = urlsplit(url)
        assert parsed.scheme == "https" and parsed.netloc == "analyzershub.com"
        assert not parsed.query and not parsed.fragment
        assert not parsed.path.endswith("index.html")
        assert not any(part.startswith(("_", ".")) for part in parsed.path.split("/") if part)
        assert not parsed.path.startswith(("/ai/", "/includes/", "/scripts/"))
        path = ROOT / parsed.path.lstrip("/")
        if parsed.path.endswith("/"):
            path /= "index.html"
        data = Metadata(path.read_text())
        assert data.canonicals == [url], path
        assert "noindex" not in data.meta.get("robots", "").lower(), path
        assert robots.can_fetch("Googlebot", url), url
        assert "venkatpalika-oss.github.io" not in json.dumps(data.schemas), path
    home = Metadata((ROOT / "index.html").read_text())
    assert home.meta["og:url"] == ORIGIN + "/"
    assert home.meta["og:type"] == "website"
    assert home.meta["twitter:card"] == "summary_large_image"
    for key in ("og:title", "og:description", "twitter:title", "twitter:description"):
        assert home.meta[key]
    for key in ("og:image", "twitter:image"):
        url = urlsplit(home.meta[key])
        assert url.scheme == "https" and url.netloc == "analyzershub.com"
        assert (ROOT / url.path.lstrip("/")).is_file()
    assert len(home.schemas) == 1 and home.schemas[0]["@type"] == "WebSite"
    assert home.schemas[0]["url"] == ORIGIN + "/"
    for name in ("ai/index.html", "blog/_blog-template.html"):
        assert "noindex" in Metadata((ROOT / name).read_text()).meta["robots"]
        assert robots.can_fetch("Googlebot", ORIGIN + "/" + name)
    print(f"PASS: SEO foundation; {len(urls)} public URLs, canonicals, schema and social metadata")


if __name__ == "__main__":
    main()
