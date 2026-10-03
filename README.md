# analyzershub
Analyzer troubleshooting and technical knowledge hub

## Public SEO foundation

The preferred origin is `https://analyzershub.com`. The initial sitemap is a
curated list of 31 public pages: core entry/contact/legal pages, the biogas
landing page, failure guides, published blog posts and CEMS lessons. It is not
an automatic inventory of every HTML file. Legacy model variants, unfinished
sections, includes, templates and the retired AI page are not advertised in it.
Other public reference pages remain crawlable; broader coverage needs a content
and duplicate-page review before adding them.

Every sitemap page has one absolute canonical in its HTML head. Directory
`index.html` pages canonicalize to the trailing-slash directory URL; other HTML
pages retain their filenames. Query strings and fragments do not enter these
static canonical URLs. Adding a public page requires both a matching canonical
and a sitemap entry. Do not point distinct articles to the homepage.

The homepage has Open Graph/Twitter metadata and one WebSite JSON-LD object.
Existing article schema types, dates and text are preserved; legacy GitHub Pages
identity URLs in the covered articles use the preferred origin. The blog
template and retired AI page use `noindex, follow` and stay crawlable so crawlers
can read that directive. Robots rules are crawl guidance, not access control.

Validate with `python3 scripts/check-seo.py` and
`python3 scripts/check-isolation.py`. This change does not configure hosting
redirects or submit the sitemap to a search engine. After deployment, verify
HTTP status, canonical tags and social-image delivery on the public domain.
