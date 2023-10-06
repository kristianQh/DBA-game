from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
import requests
import time


options = Options()
options.add_argument('--headless')
driver = webdriver.Firefox(options=options)
driver.get('https://www.dba.dk/')
time.sleep(2)
html = driver.page_source

# url = "https://www.dba.dk/"
# result = requests.get(url)
doc = BeautifulSoup(html, "html.parser")

h = doc.find_all("a", {"class": "gallery-cell gallery-cell-default"})
print(h[0].get('href'))
# print(doc.prettify)
# url = "https://www.dba.dk/kommode-laminat-paen-kommo/id-1105768623/"

# result = requests.get(url)
# doc = BeautifulSoup(result.text, "html.parser")
# # print(doc.prettify())

# prices = doc.find_all("span", {"class": "price-tag"})
# title = doc.find_all("h1")
# description = doc.find_all("div", {"class": "vip-additional-text"})
# images = doc.find_all("div", {"class": "vip-picture-gallery"})
# for div in images:
#     links = div.find_all("a")
#     for a in links:
#         print("http://www.dba.dk/" + a['href'])
# print(prices[0].string)
# print(title[0].string)
# print(description[0])
# print(images)