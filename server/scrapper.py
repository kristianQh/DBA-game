import re
import requests
from bs4 import BeautifulSoup


class DBAScrapper:
    def scrape_descriptions(self, doc):
        description_html = doc.find("div", {"class": "vip-additional-text"})
        # Retrieve string with extra whitespace removed
        description_texts = list(description_html.stripped_strings)
        # Create a single string
        description_text = "\n".join(description_texts)
        # Remove any indication of price with regex
        # Match integeres and integers ranges followed by 'kr' or 'kr.'
        description_text = re.sub(r"\d+(?:-\d+)? kr\.?", "❌ kr.", description_text)
        return description_text

    def scrape_article(self, url):
        try:
            result = requests.get(url, timeout=10)
            doc = BeautifulSoup(result.text, "html.parser")
            price = doc.find("span", {"class": "price-tag"})
            # Only interested in the integer price in 'x kr.'
            price_num = int(price.text.split(" ")[0])
            title = doc.find("h1").text
            description = self.scrape_descriptions(doc)
            image_urls = []
            images = doc.find("div", {"class": "vip-picture-gallery"})
            # Primary/active image is two times in gallery, so ignore first
            image_urls = [img["src"] for img in images.find_all("img")[1:]]
            return {
                "title": title,
                "descritpion": description,
                "price": price_num,
                "image_urls": image_urls,
            }
        except requests.Timeout:
            return "Timeout occurred, maybe request again?"
        # AttributeError is a bit of a hacky exception type for now
        except AttributeError:
            return "Error, possibly wrong link?"
