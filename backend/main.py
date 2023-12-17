from fastapi import FastAPI, HTTPException, Depends
from collections import defaultdict
import json
import pymysql
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 오리진 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 메소드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)



def get_db():
    conn = pymysql.connect(
        host="localhost",
        user="crawl_usr",
        password="USER1",
        database="newstory"
    )
    try:
        yield conn
    finally:
        conn.close()



def get_article_summary(text):
    summaries = text.split('\n') if text else [''] * 3
    return {
        "summary_1": summaries[0] if len(summaries) > 0 else "",
        "summary_2": summaries[1] if len(summaries) > 1 else "",
        "summary_3": summaries[2] if len(summaries) > 2 else ""
    }



@app.get("/rss")
def get_rss_data(conn: pymysql.connections.Connection = Depends(get_db)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT *
            FROM (
                SELECT *,
                       ROW_NUMBER() OVER(PARTITION BY news.NEWS_CATEGORY ORDER BY DATE_ADDED DESC) AS row_num
                FROM news 
                INNER JOIN story ON news.ID = story.STORY_ID
                where news.IS_BREAKING = 0
            ) AS ranked_data
            WHERE row_num <= 20
            ORDER BY NEWS_CATEGORY, DATE_ADDED DESC;
        """)

        data = cursor.fetchall()
        
        categories = defaultdict(list) # 카테고리명을 키로 하는 딕셔너리
        
        for row in data:

             # 카테고리별로 데이터 그룹화
            category_name = row[1]  # NEWS_CATEGORY에 해당하는 컬럼
            summary_data = get_article_summary(row[13])

            article_data = {
                "id": row[0],
                "press": row[2],
                "title": row[3],
                "url": row[6],
                "keyword" : row[12],
                "avatar": row[14],
                "storyData": [
                    {
                        "text": summary_data["summary_1"],
                        "img": row[14]
                    },
                    {
                        "text": summary_data["summary_2"],
                        "img": row[15]
                    },
                    {
                        "text": summary_data["summary_3"],
                        "img": row[16]
                    }
                    ]
            }
            if len(categories[category_name]) < 20:  # 각 카테고리별로 10개까지만 가져오도록
                categories[category_name].append(article_data)

        # 카테고리별로 최신 뉴스가 먼저 나오도록 정렬
        categorized_news = [{"name": cat, "data": categories[cat]} for cat in categories]
        categories = {'categories':categorized_news}
        # JSON 형태로 변환하여 반환
        return categories

    except Exception as e:
        # 예외가 발생하면 Internal Server Error 반환
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
    finally:
        cursor.close()


# 속보인 뉴스들 
@app.get("/rss2")
def get_rss_data2(conn: pymysql.connections.Connection = Depends(get_db)):
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT news.*
            FROM news
            WHERE news.IS_BREAKING = 1
            ORDER BY news.DATE_ADDED DESC;
        """)

        data = cursor.fetchall()

        breaking_data=[] # 카테고리명을 키로 하는 딕셔너리

        for row in data:
            pub_date_str = row[8].strftime("%Y-%m-%d %H:%M:%S")
            article_data = {
                "press": row[2],
                "title": row[3],
                "passage" : row[4],
                "image" : row[5],
                "url": row[6],
                "pub_date" : pub_date_str
            }

            breaking_data.append(article_data)

    
        # JSON 형태로 변환하여 반환
        return json.loads(json.dumps(breaking_data))

    except Exception as e:
        print(e)  # 에러 출력
        raise HTTPException(status_code=500, detail="Internal Server Error")
    


