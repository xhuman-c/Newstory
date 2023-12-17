############스케줄러###############
import pymysql
import requests
from bs4 import BeautifulSoup
from urllib.request import urlopen
from datetime import datetime
import feedparser
import sys,os
sys.path.insert(0, os.path.abspath('.'))
import ner_module2
import sum_module
import schedule
import time

hankook = [
    {"ECONOMY": "https://www.hankyung.com/feed/economy"},
    {"ENTERTAIN": "https://www.hankyung.com/feed/entertainment"},
    {"POLITICS": "https://www.hankyung.com/feed/politics"},
    {"SOCIETY": "https://www.hankyung.com/feed/society"},
    {"SPORTS": "https://www.hankyung.com/feed/sports"},
    {"WORLD": "https://www.hankyung.com/feed/international"},
    {"IT": "https://www.hankyung.com/feed/it"},
]

dongA = [
    {"ECONOMY": "https://rss.donga.com/economy.xml"},
    {"CULTURE": "https://rss.donga.com/culture.xml"},
    {"SOCIETY": "https://rss.donga.com/national.xml"},
    {"SPORTS": "https://rss.donga.com/sports.xml"},
    {"WORLD": "https://rss.donga.com/international.xml"},
]

segye = [
    {"ECONOMY":"https://www.segye.com/Articles/RSSList/segye_economy.xml"},
    {"ENTERTAIN": "https://www.segye.com/Articles/RSSList/segye_entertainment.xml"},
    {"POLITICS": "https://www.segye.com/Articles/RSSList/segye_politic.xml"},
    {"SOCIETY": "https://www.segye.com/Articles/RSSList/segye_society.xml"},
    {"SPORTS": "https://www.segye.com/Articles/RSSList/segye_sports.xml"},
    {"WORLD": "https://www.segye.com/Articles/RSSList/segye_international.xml"},
    {"CULTURE": "https://www.segye.com/Articles/RSSList/segye_culture.xml"}
]


hankyoreh = [
    {'ECONOMY':"https://www.hani.co.kr/rss/economy/"},
    {'POLITICS':"https://www.hani.co.kr/rss/politics/"},
    {'SOCIETY':"https://www.hani.co.kr/rss/society/"},
    {'CULTURE':"https://www.hani.co.kr/rss/culture/"},
    {'SPORTS':"https://www.hani.co.kr/rss/sports/"},
    {'WORLD':"https://www.hani.co.kr/rss/international/"}
]

seoul = [
    {'SEOUL':"https://www.onseoul.net/rss/S1N1.xml"}
]

rss_feeds = [
    {'press': 'Hankook', 'feeds': hankook},
    {'press': 'DongA', 'feeds': dongA},
    {'press': 'SEGYE', 'feeds': segye},
    {'press': 'Hankyoreh', 'feeds': hankyoreh},
    {'press': 'Seoul', 'feeds': seoul}
]



# MySQL 서버 연결 설정
def connect_to_db():
    return pymysql.connect(
        host="localhost",
        user="crawl_usr",
        password="USER1",
        database="newstory"
    )




# 기존 URL 가져오기
def get_existing_urls(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT URL FROM news")
    existing_urls = [row[0] for row in cursor.fetchall()]
    return existing_urls




# RSS 피드로부터 기사 링크 추출
def get_article_links(rss_feeds, existing_urls):
    all_links = []
    for feed_info in rss_feeds:
        press = feed_info['press']
        for category_info in feed_info['feeds']:
            for category, url in category_info.items():
                response = requests.get(url)
                feed_data = feedparser.parse(response.text)
                links = [entry.link for entry in feed_data.entries if entry.link not in existing_urls]
                all_links.append({'press': press, 'category': category, 'links': links})
    return all_links



# 크롤링 해서 뉴스 데이터와 스토리 데이터 수집
def fetch_article_info(press_articles):
    article_info_list = []
    ex_label = ['기간', '년', '달', '날짜 절기', '순서', '금액', '기타', '비율', '수량', '1', '인원', '면적' ,'방향', '부분명칭', '세포, 조직, 기관', '프로젝트', '국가', '대륙', '도시', '도, 주', '시각','나이','민족, 종족', '길이','면적','URL주소','전화번호','음악앨범수량','모델명 일련번호','무게','속도', '온도', '부피','주소숫자']
    for article in press_articles:
        press = article['press']
        category = article['category']
        urls = article['links']
        print(press, category)
        
        for url in urls:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')

            article_info = {}
            article_info['news_category'] = category
            article_info['url'] = url #기사url
            title = '' #제목
            modified_article_text = '' #기사원문
            image_urls = '' #이미지 주소
            reporter_names_str = '' #기자명
            publication_date = None #등재일
            is_breaking = 0 #속보여부
            sum_results = [] #요약문
            ner_results = [] #태그

            ##########################################################################
            if press == 'Hankook':
                # 한국경제 크롤링 로직
                print('한국경제 크롤링 시작')

                article_info['press'] = '한국경제'

                # 제목
                title_tag = soup.find('h1', class_='headline')

                if title_tag:
                    title = title_tag.text.strip()
                                    
                    # '[포토]', '[모닝브리핑]'을 포함하는 경우 건너뛰기
                    if '[포토]' in title or '[모닝브리핑]' in title:
                        continue
                                    
                    is_breaking = 1 if '[속보]' in title else 0
                else: continue
                
                article_info['title'] = title
                article_info['is_breaking'] = is_breaking

                # 본문과 이미지
                article_body = soup.find('div', id='articletxt')
                if article_body:

                    # 이미지
                    image_tags = article_body.find_all('figure')
                    if image_tags:
                        image_urls = [img.find('img')['src'] for img in image_tags if img.find('img')]
                        if not image_urls:
                            continue
                        article_info['image_original_url'] = image_urls
                    else: continue


                    # 본문 
                    for fig_caption in article_body.find_all('figcaption'):
                        fig_caption.decompose()  # 사진 설명 제거 
                    
                    for ad_wrap in article_body.find_all('div', class_='ad-wrap'):
                        ad_wrap.decompose()  # 광고 제거 

                    article_text = article_body.get_text(separator='\n', strip=True)
                    
                    sentences = article_text.split('\n')  # 문장 단위로 분리
                    sentences = sentences[:-1]

                    if is_breaking==0: # 속보가 아닌 경우
                        if len(sentences) > 3:
                            modified_article_text = '\n'.join(sentences)
                            sum_results = sum_module.summarize_test(modified_article_text) # 본문 내용으로 요약진행
                            if not all(sentence.endswith('.') for sentence in sum_results): continue
                            if any(len(sentence) > 155 for sentence in sum_results):continue
                            
                            ner_results = ner_module2.ner_predict('\n'.join(sum_results))
                            final_list = list()
                            for l in ner_results:
                                if l['desc'] in ex_label or len(l['word']) == 1:
                                    continue
                                else:
                                    if len(final_list) == 5: break
                                    cleaned_text = '#'+(l['word'].replace(' ','').replace('<',''))
                                    if cleaned_text in final_list: continue
                                    final_list.append(cleaned_text)
                            ner_results = final_list
                            
                        else: continue

                    else: # 속보인 경우
                        if len(sentences) > 3:
                            breaking_sum = sum_module.summarize_test('\n'.join(sentences)) #속보 내용 요약
                            modified_article_text = '\n'.join(breaking_sum) # 속보의 본문으로 저장
                        else: 
                            modified_article_text = '\n'.join(sentences)


                    article_info['passage'] = modified_article_text
                    article_info['summary'] = sum_results
                    article_info['keyword'] = ner_results

                else:
                    continue


                # 기자명
                
                reporters = soup.find_all('div', class_='author')
                if reporters:
                    reporter_names = [reporter['data-name'].strip() for reporter in reporters if 'data-name' in reporter.attrs]
                    reporter_names_str = ', '.join(reporter_names)

                article_info['writer'] = reporter_names_str

                
                #등재일
                date_tag = soup.find('span', class_='txt-date')
                if date_tag:
                    publication_date = date_tag.text.strip()
                
                article_info['date_added'] = publication_date
                
                
                # article_info_list에 취합
                article_info_list.append(article_info)
                print('한국경제 크롤링 종료')
            
                 
            ##########################################################################
            elif press == 'DongA':
                # 동아일보 크롤링 로직 
                print('동아일보 크롤링 시작')
                article_info['press'] = '동아일보'
                

                # 제목
                title_tag = soup.find('h1', class_='title')

                if title_tag:
                    title = title_tag.text.strip()
                                    
                    # '[포토]', '[모닝브리핑]'을 포함하는 경우 건너뛰기
                    if '[포토]' in title or '[모닝브리핑]' in title:
                        continue
                                    
                    is_breaking = 1 if '[속보]' in title else 0
                else: continue
                
                article_info['title'] = title
                article_info['is_breaking'] = is_breaking
              

                # 본문과 이미지
                article_body = soup.find('div', id='article_txt')
                if article_body:
                    # 이미지
                    image_tags = article_body.find_all('div', class_='articlePhotoC')
                    if image_tags:
                        image_urls = [img.find('img')['src'] for img in image_tags if img.find('img')]
                        if not image_urls: 
                            continue
                        article_info['image_original_url'] = image_urls
                    else: continue


                    # 본문 
                    for tag in article_body(['strong', 'div', {'class': ['articlePhotoR', 'adwrap_box', 'article_issue', 'article_footer', 'armerica_ban']}]):
                        tag.decompose()

                    # 본문에서 텍스트만 가져옵니다.
                    article_text = article_body.get_text(separator='\n', strip=True)

                    sentences = article_text.split('\n')  # 문장 단위로 분리
                    sentences = sentences[:-1]

                    if is_breaking==0: # 속보가 아닌 경우
                        if len(sentences) > 3:
                            modified_article_text = '\n'.join(sentences)  # 마지막 문장을 제외한 나머지 문장들을 다시 합치기
                            sum_results = sum_module.summarize_test(modified_article_text) # 본문 내용으로 요약진행
                            if not all(sentence.endswith('.') for sentence in sum_results): continue
                            if any(len(sentence) > 155 for sentence in sum_results):continue

                            ner_results = ner_module2.ner_predict('\n'.join(sum_results))
                            final_list = list()
                            for l in ner_results:
                                if l['desc'] in ex_label or len(l['word']) == 1:
                                    continue
                                else:
                                    if len(final_list) == 5: break
                                    cleaned_text = '#'+(l['word'].replace(' ','').replace('<',''))
                                    if cleaned_text in final_list: continue
                                    final_list.append(cleaned_text)
                            ner_results = final_list
                            
                        else: continue

                    else: # 속보인 경우
                        if len(sentences) > 3:
                            breaking_sum = sum_module.summarize_test('\n'.join(sentences)) #속보 내용 요약
                            modified_article_text = '\n'.join(breaking_sum) # 속보의 본문으로 저장
                        else: 
                            modified_article_text = '\n'.join(sentences)


                    article_info['passage'] = modified_article_text
                    article_info['summary'] = sum_results
                    article_info['keyword'] = ner_results


                else:
                    continue


                # 기자명
                reporter_tag = soup.find('span', class_='name')
                if reporter_tag:
                    reporter_names_str = reporter_tag.text.strip()
                    
                article_info['writer'] = reporter_names_str

                
                #등재일
                date_tag = soup.find('span', class_='date01')
                if date_tag:
                    input_date_str = date_tag.text.strip().replace('입력 ', '')  # '입력' 텍스트 제거
                    publication_date = datetime.strptime(input_date_str, "%Y-%m-%d %H:%M")
                
                article_info['date_added'] = publication_date
            

                # article_info_list에 취합
                article_info_list.append(article_info) 
                print('동아일보 크롤링 완료')


            ##########################################################################            
            elif press == 'SEGYE':
                # 세계일보 크롤링 로직 
                print('세계일보 크롤링 시작') 

                article_info['press'] = '세계일보'

                # 제목
                title_tag = soup.find('h3', id='title_sns')

                if title_tag:
                    title = title_tag.text.strip()
                                    
                    # '[포토]', '[모닝브리핑]'을 포함하는 경우 건너뛰기
                    if '[포토]' in title or '[모닝브리핑]' in title:
                        continue
                                    
                    is_breaking = 1 if '[속보]' in title else 0
                else: continue

                article_info['title'] = title
                article_info['is_breaking'] = is_breaking
              

                # 본문과 이미지
                article_body = soup.find('article', class_='viewBox2')
                if article_body:
                    # 이미지
                    image_tags = article_body.find_all('figure', class_='image')
                    if image_tags:
                        image_urls = [img.find('img')['src'] for img in image_tags if img.find('img')]
                        if not image_urls: 
                            continue
                        image_urls = ['https:' + url if not url.startswith('http') else url for url in image_urls]
                        article_info['image_original_url'] = image_urls
                    else: continue


                    # 본문 
                    for tag in article_body('em' ,class_='precis'):
                        tag.decompose()

                    for tag in article_body(['iframe','figcaption']):
                        tag.decompose()


                    # 본문에서 텍스트만 가져옵니다.
                    article_text = article_body.get_text(separator='\n', strip=True)


                    sentences = article_text.split('\n')  # 문장 단위로 분리
                    sentences = sentences[:-2]

                    if is_breaking==0: # 속보가 아닌 경우
                        if len(sentences) > 3:
                            modified_article_text = '\n'.join(sentences) 
                            sum_results = sum_module.summarize_test(modified_article_text) # 본문 내용으로 요약진행
                            if not all(sentence.endswith('.') for sentence in sum_results): continue
                            if any(len(sentence) > 155 for sentence in sum_results):continue
                            
                            ner_results = ner_module2.ner_predict('\n'.join(sum_results))
                            final_list = list()
                            for l in ner_results:
                                if l['desc'] in ex_label or len(l['word']) == 1:
                                    continue
                                else:
                                    if len(final_list) == 5: break
                                    cleaned_text = '#'+(l['word'].replace(' ','').replace('<',''))
                                    if cleaned_text in final_list: continue
                                    final_list.append(cleaned_text)
                            ner_results = final_list
                            
                        else: continue

                    else: # 속보인 경우
                        if len(sentences) > 3:
                            breaking_sum = sum_module.summarize_test('\n'.join(sentences)) #속보 내용 요약
                            modified_article_text = '\n'.join(breaking_sum) # 속보의 본문으로 저장
                        else: 
                            modified_article_text = '\n'.join(sentences)


                    article_info['passage'] = modified_article_text
                    article_info['summary'] = sum_results
                    article_info['keyword'] = ner_results
                        


                else:
                    continue


                # 기자명
                reporter_tag = article_body.find('div')
                if reporter_tag:
                    reporter_names = reporter_tag.text
                    reporter_names = reporter_names.split('=')[1] if '=' in reporter_names else reporter_names
                    reporter_names_str = reporter_names.split('기자')[0]
                    reporter_names_str = reporter_names_str.strip()
                    if len(reporter_names_str) > 5:
                        reporter_names_str = ''
                    
                article_info['writer'] = reporter_names_str

                
                #등재일
                date_tag = soup.find('p', class_='viewInfo')
                if date_tag:

                    for tag in date_tag('span', class_='modify'):
                        tag.decompose()

                    publication_date = date_tag.text.strip().replace('입력 : ', '')  # '입력' 텍스트 제거
                    
                article_info['date_added'] = publication_date


                article_info_list.append(article_info)
                print('세계일보 크롤링 완료')


            ##########################################################################
            elif press == 'Hankyoreh':
                # 한겨레 크롤링 로직 
                print('한겨레 크롤링 시작')

                article_info['press'] = '한겨레'
                

                # 제목
                title_tag = soup.find('span', class_="title")
                if title_tag:
                    title = title_tag.text.strip()
                                    
                    # '[포토]', '[모닝브리핑]'을 포함하는 경우 건너뛰기
                    if '[포토]' in title or '[모닝브리핑]' in title:
                        continue
                                    
                    is_breaking = 1 if '[속보]' in title else 0
                else: continue

                article_info['title'] = title
                article_info['is_breaking'] = is_breaking
                

                # 본문과 이미지
                article_body = soup.find('div', class_='text')
                if article_body:
                    # 이미지
                    image_tags = article_body.find_all('div', class_='image')
                    if image_tags:
                        image_urls = [img.find('img')['src'] for img in image_tags if img.find('img')]
                        if not image_urls: 
                            continue
                        image_urls = ['https:' + url if not url.startswith('http') else url for url in image_urls]
                        article_info['image_original_url'] = image_urls
                    else: continue
                    # print(image_urls)


                    # 본문 
                    for tag in article_body('div', id="ad_tag"):
                        tag.decompose() # 광고 제거
                    for tag in article_body('div', id="dcamp_ad_23498"):
                        tag.decompose()  # 영상 제거


                    # 본문에서 텍스트만 가져옵니다.
                    article_text = article_body.get_text(separator='\n', strip=True)

                    sentences = article_text.split('\n')  # 문장 단위로 분리
                    sentences = sentences[:-1]

                    if is_breaking==0: # 속보가 아닌 경우
                        if len(sentences) > 3:
                            modified_article_text = '\n'.join(sentences) 
                            sum_results = sum_module.summarize_test(modified_article_text) # 본문 내용으로 요약진행
                            if not all(sentence.endswith('.') for sentence in sum_results): continue
                            if any(len(sentence) > 155 for sentence in sum_results):continue
                            
                            ner_results = ner_module2.ner_predict('\n'.join(sum_results))
                            
                            final_list = list()
                            for l in ner_results:
                                if l['desc'] in ex_label or len(l['word']) == 1:
                                    continue
                                else:
                                    if len(final_list) == 5: break
                                    cleaned_text = '#'+(l['word'].replace(' ','').replace('<',''))
                                    if cleaned_text in final_list: continue
                                    final_list.append(cleaned_text)
                            ner_results = final_list
                            
                        else: 
                            continue

                    else: # 속보인 경우
                        if len(sentences) > 3:
                            breaking_sum = sum_module.summarize_test('\n'.join(sentences)) #속보 내용 요약
                            modified_article_text = '\n'.join(breaking_sum) # 속보의 본문으로 저장
                        else: 
                            modified_article_text = '\n'.join(sentences)


                    article_info['passage'] = modified_article_text
                    article_info['summary'] = sum_results
                    article_info['keyword'] = ner_results


                else:
                    continue


                # 기자명 
                reporter_tag = soup.find('div', class_='kiza-info')
                if reporter_tag:
                    reporter_names_str = reporter_tag.find('strong').text
                    
                article_info['writer'] = reporter_names_str

                
                #등재일
                date_tag = soup.find('p', class_='date-time')
                if date_tag:
                    publication_date = date_tag.find('em', text='등록 ').next_sibling.strip()

                article_info['date_added'] = publication_date

                article_info_list.append(article_info)
                print('한겨레 크롤링 완료')


            ##########################################################################
            elif press == 'Seoul':
                # 서울자치신문 크롤링 로직
                print('서울자치신문 크롤링 시작')

                article_info['press'] = '서울자치신문'

                # 제목
                title_tag = soup.find('h3', class_='heading')

                if title_tag:
                    title = title_tag.text.strip()
                                    
                    # '[포토]', '[모닝브리핑]'을 포함하는 경우 건너뛰기
                    if '[포토]' in title or '[모닝브리핑]' in title:
                        continue
                                    
                    is_breaking = 1 if '[속보]' in title else 0
                else: continue
                
                article_info['title'] = title
                article_info['is_breaking'] = is_breaking

                # 본문과 이미지
                article_body = soup.find('article', id='article-view-content-div')
                if article_body:

                    # 이미지
                    image_tags = article_body.find_all('figure')
                    if image_tags:
                        image_urls = [img.find('img')['src'] for img in image_tags if img.find('img')]
                        if not image_urls:
                            continue
                        article_info['image_original_url'] = image_urls
                    else: continue


                    # 본문 
                    for fig_caption in article_body.find_all('figcaption'):
                        fig_caption.decompose()  # 사진 설명 제거 
                    
                    for ad_wrap in article_body.find_all('div', id='AD160505799095'):
                        ad_wrap.decompose()  # 광고 제거 

                    article_text = article_body.get_text(separator='\n', strip=True)
                    
                    sentences = article_text.split('\n')  # 문장 단위로 분리

                    if is_breaking==0: # 속보가 아닌 경우
                        if len(sentences) > 3:
                            modified_article_text = '\n'.join(sentences)  # 마지막 문장을 제외한 나머지 문장들을 다시 합치기
                            sum_results = sum_module.summarize_test(modified_article_text) # 본문 내용으로 요약진행
                            if not all(sentence.endswith('.') for sentence in sum_results): continue
                            if any(len(sentence) > 155 for sentence in sum_results):continue
                            
                            ner_results = ner_module2.ner_predict('\n'.join(sum_results))
                            final_list = list()
                            for l in ner_results:
                                if l['desc'] in ex_label or len(l['word']) == 1:
                                    continue
                                else:
                                    if len(final_list) == 5: break
                                    cleaned_text = '#'+(l['word'].replace(' ','').replace('<',''))
                                    if cleaned_text in final_list: continue
                                    final_list.append(cleaned_text)
                            ner_results = final_list
                            
                        else: continue

                    else: # 속보인 경우
                        if len(sentences) > 3:
                            modified_article_text = sum_module.summarize_test('\n'.join(sentences)) #속보 내용 요약
                            modified_article_text = '\n'.join(sentences) # 속보의 본문으로 저장
                        else: 
                            modified_article_text = '\n'.join(sentences)


                    article_info['passage'] = modified_article_text
                    article_info['summary'] = sum_results
                    article_info['keyword'] = ner_results

                else:
                    continue


                # 기자명
                
                reporter_tag = soup.find('a', class_='name')
                if reporter_tag:
                    reporter_names_str = reporter_tag.text.strip()
                    
                article_info['writer'] = reporter_names_str

                
                #등재일
                article_info['date_added'] = publication_date
                
                
                # article_info_list에 취합
                article_info_list.append(article_info)
                print('서울자치신문 크롤링 종료')
            

    return article_info_list


# 데이터베이스에 데이터 삽입
def insert_articles_to_db(conn, article_info_list):
    try:
        # 커서 생성
        cursor = conn.cursor()

        for article_info in article_info_list:

            image_urls_to_store = ', '.join(article_info['image_original_url'][:3]) if article_info['image_original_url'] else None

            # news 테이블에 데이터 삽입
            print('뉴스테이블 데이터 삽입')
            print(article_info['title'])
            insert_news_query = """
            INSERT INTO news (NEWS_CATEGORY, PRESS, TITLE, PASSAGE, IMAGE_ORIGINAL_URL, URL, WRITER, DATE_ADDED, DATE2, IS_BREAKING)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), %s)
            """
            cursor.execute(insert_news_query, (
                article_info['news_category'],
                article_info['press'],
                article_info['title'],
                article_info['passage'],
                image_urls_to_store,  # 최대 3개의 이미지 URL(너무 많은 경우가 있어서 자꾸 넘쳐요)
                article_info['url'],
                article_info['writer'],
                article_info['date_added'],
                article_info['is_breaking']
            ))

            story_id = cursor.lastrowid

            image_2 = article_info['image_original_url'][1] if len(article_info['image_original_url']) > 1 else article_info['image_original_url'][-1]
            image_3 = article_info['image_original_url'][2] if len(article_info['image_original_url']) > 2 else article_info['image_original_url'][-1]

            print('스토리테이블 데이터 삽입')
            insert_story_query = """
            INSERT INTO story (STORY_ID, KEYWORD, SUMMARY, IMAGE_1, IMAGE_2, IMAGE_3)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_story_query, (
                story_id,
                ', '.join(article_info['keyword']) if article_info['keyword'] else None,  # 키워드
                '\n'.join(article_info['summary']) if article_info['summary'] else None,  # 요약
                article_info['image_original_url'][0],
                image_2,
                image_3
            ))

        # 변경사항 커밋
        conn.commit()

    except pymysql.Error as e:
        print(f"데이터베이스 오류 발생: {e}")
        conn.rollback()

    finally:
        # 연결 종료
        if conn.open:
            cursor.close()
            conn.close()
            print("MySQL 연결이 닫혔습니다.")


# 주기적으로 실행할 작업
def job():
    print("작업 시작")
    
    conn = connect_to_db()
    existing_urls = get_existing_urls(conn)
    press_articles = get_article_links(rss_feeds, existing_urls)
    article_info_list = fetch_article_info(press_articles)
    insert_articles_to_db(conn, article_info_list)

    print("작업 완료")


# 스케줄러 설정
schedule.every(10).minutes.do(job)

while True:
    schedule.run_pending()
    time.sleep(1)