import pymysql

# MySQL 서버 연결 설정
conn = pymysql.connect(
    host="localhost",
    user="crawl_usr",
    password="USER1",
    database="newstory"
)


# 테이블 생성 쿼리
create_news_table_query = """
    CREATE TABLE IF NOT EXISTS news (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        NEWS_CATEGORY VARCHAR(50) NOT NULL,
        PRESS VARCHAR(100) NOT NULL,
        TITLE VARCHAR(1000) NOT NULL,
        PASSAGE TEXT NULL,
        IMAGE_ORIGINAL_URL TEXT NOT NULL,
        URL VARCHAR(500) NOT NULL,
        WRITER VARCHAR(50),
        DATE_ADDED TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        DATE2 TIMESTAMP NULL,
        IS_BREAKING BOOL DEFAULT 0
    )
"""

create_story_table_query = """
    CREATE TABLE IF NOT EXISTS story (
        STORY_ID INT NOT NULL ,
        FOREIGN KEY (STORY_ID) REFERENCES news(ID),
        KEYWORD VARCHAR(200) NULL,
        SUMMARY TEXT,
        IMAGE_1 VARCHAR(500),
        IMAGE_2 VARCHAR(500),
        IMAGE_3 VARCHAR(500)
    )
"""

try:
    # 커서 생성
    cursor = conn.cursor()

    # news 테이블 생성
    cursor.execute(create_news_table_query)

    # story 테이블 생성
    cursor.execute(create_story_table_query)


    # 변경사항 커밋
    conn.commit()

    print("news, story 테이블이 성공적으로 생성되었습니다.")

except pymysql.Error as e:
    print(f"오류 발생: {e}")

finally:
    # 연결 및 커서 종료
    if 'conn' in locals() and conn.open:
        cursor.close()
        conn.close()
        print("MySQL 연결이 닫혔습니다.")