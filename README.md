# Newstory
자연어처리 6조 박예린, 최은서

## 프로젝트 목적
도파민에 중독되어 숏 컨텐츠에서 벗어나지 못하는 사람들.뉴스, 긴 글을 소비하지 않는 젊은 세대들에게 친숙한 인터페이스로 건강한 뉴스를 소비할 수 있도록 도모함.


## 구성 
- backend 
- frontend
- model-kpfbert  

  
    ㄴ SUM  : 의미 전달에 변질이 되면 안되는 뉴스 기사의 특징을 고려하여 생성요약이 아닌, 추출요약을 실행. (EXT)

  
    ㄴ NER  :  편리한 서비스 제공을 위해 NER을 통한 키워드 추출 진행. 

## Installaton
    git clone https://github.com/KPFBERT/kpfbertsum.git # 크기가 큰 model-kpfbert/kpfbert-base 모델은 여기서 다운로드 해야 한다. 
    git clone https://github.com/xhuman-c/Newstory.git  # newstory 파일 


### requirements
    !pip  install pytorch-lightning==1.2.8
    !pip  install transformers

    
파이썬 버전 3.7로 설치 


    !wget https://www.python.org/ftp/python/3.7.0/Python-3.7.0.tgz
    !tar xvfz Python-3.7.0.tgz
    !Python-3.7.0/configure
    !make
    !sudo make install



## server
빠른 연결을 위해 FastAPI 사용


서버연결시 터미널 창에 다음 입력.

    pip install fast api
    pip install uvicorn
    uvicorn main:app --reload 



