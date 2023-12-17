categories = [];

// 이미지 URL 가져오기
const closeImageUrl = chrome.runtime.getURL('images/icon/x.png');
const backImageUrl = chrome.runtime.getURL('images/icon/back.png');
const nextImageUrl = chrome.runtime.getURL('images/icon/next.png');
const starImageUrl = chrome.runtime.getURL('images/icon/star.png');
const star2ImageUrl = chrome.runtime.getURL('images/icon/star2.png');
const moreImageUrl = chrome.runtime.getURL('images/icon/more-info.png');
const dotsImageUrl = chrome.runtime.getURL('images/icon/dots.png');
const economyImageUrl = chrome.runtime.getURL('images/category/economy.png');
const entertainmentImageUrl = chrome.runtime.getURL('images/category/enter.png');
const itImageUrl = chrome.runtime.getURL('images/category/it.png');
const politicsImageUrl = chrome.runtime.getURL('images/category/politics.png');
const sportsImageUrl = chrome.runtime.getURL('images/category/sports.png');
const hankukImageUrl = chrome.runtime.getURL('images/press/hankuk.png');
const dongAImageUrl = chrome.runtime.getURL('images/press/dongA.png');
const mtImageUrl = chrome.runtime.getURL('images/press/mt.png');
const segyeImageUrl = chrome.runtime.getURL('images/press/segye.png');
const haniImageUrl = chrome.runtime.getURL('images/press/hani.png');

// CSS 스타일 정의
let cssStyles = `
.stories-container {
  display: flex;
  background: #fff;
  // box-shadow: 0 3px 24px -8px rgba(0, 0, 0, 0.3);
  width: 640px;
  margin: 0 auto;
  margin-bottom: 10px;
  padding: 7px;
  border-radius: 8px;
  gap: 24px;
  overflow: hidden;
  overflow-x: scroll;
  box-sizing: border-box;
  flex-direction: row;
  font-size: var(--system-12-font-size);
  line-height: var(--system-12-line-height);
  font-weight: var(--font-weight-system-regular);
  font-family: var(--font-family-system);
  letter-spacing: .01em;
  text-align: center;
}
/* 웹킷 기반 브라우저를 위한 스크롤바 숨김 */
.stories-container::-webkit-scrollbar {
  display: none;
}

/* Firefox를 위한 스크롤바 숨김 */
.stories-container {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.stories-container .category-name {
  position: relative;
}

.stories-container .category-name img {
  height: 56px;
  width: 56px;
  border-radius: 50%;
  object-fit: cover;
  z-index: 300;
  position: relative;
  vertical-align: middle;
}

.stories-container .content img {
  height: 56px;
  width: 56px;
  border-radius: 50%;
  object-fit: cover;
  z-index: 300;
  position: relative;
  vertical-align: middle;
}

.stories-container .content {
  position: relative;
  cursor: pointer;
}

.stories-container .content::before {
  content: "";
  height: 60px;
  width: 60px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 101;
}

.stories-container .content:not(.content-selected)::after {
  content: "";
  height: 64px;
  width: 64px;
  // background: linear-gradient(#dd2a7b, #f58529);
  background: linear-gradient(#ffe400, #5d5d5d);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.content-selected::after {
  content: "";
  height: 61.7px;
  width: 61.7px;
  background: lightgray;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}




.feed-container {
  width: 100%;
  max-width: 600px; 
  margin-top:4%;
}

.post {
  margin-bottom: 20px;
  // background-color: ;
  border-bottom: 1px solid lightgray;
  
}

.post-header {
  padding: 5px;
}


.profile-pic {
  width: 32px; /* 프로필 이미지 크기 */
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid #e8e8e8;
}

.username {
  // font-weight: 600;
  // font-size: 12px;
}


.post-image {
  width: 100%;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  margin-top: 4px;
  display: block; /* 이미지가 div의 전체 너비를 차지하도록 함 */
}

.likes {
  font-weight: bold;
}

.description {
  margin-top: 5px;
  font-size: 14px;
}

.timestamp {
  color: #8e8e8e;
  font-size: 12px;
  margin-top: 5px;
  margin-bottom:20px;
}




.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(5, 5, 5, 1);
  display: flex;
  justify-content: center;
  align-items: center;
}
.logo{
  position:fixed;
  top:10px;
  left:10px;
  background-color: yellow;
  z-index: 9999;
  cursor:pointer;
}
.close{
  position:fixed;
  top:15px;
  right:15px;
  z-index: 9999;
  cursor:pointer;
}
.arrow {
  width:30px;
  height:30px;
  background-size: cover;
  opacity: 0.3;
  cursor: pointer;
}
.arrow:hover{
  opacity: 0.8;
}
.left-arrow{
  margin-right:1.5%;
}
.right-arrow{
  margin-left:1.5%;
}

.outer-window{
  position:relative;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  /* background-color: red; */
  z-index: 9999;
  overflow: hidden;
  border-radius: 5px;
}


.story-wrapper {
  display: flex;
  flex-direction: row;
  width: 100%; /*(100%*profile length로 구해야함)*/
  height: 100%; /* 래퍼의 높이를 100%로 설정 */
}

.story-wrapper {
  transition: transform 0.5s ease;
}

.story-container {
  position:relative;
  background-color: rgba(5, 5, 5, 0.911);
  width: 100%;
  height: 100%; /* 각 스토리 컨테이너의 높이를 래퍼와 동일하게 설정 */
  /* 나머지 스타일 */
  justify-content: center;
  align-items: center;
}

.content-container{
  position:relative;
  height:100%;
  width:100%;
  background: linear-gradient(rgb(48, 47, 47),rgb(79, 79, 79) ,rgb(86, 85, 85),rgb(66, 65, 65),rgba(37, 37, 37, 0.837));
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.content-container::after{
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%; 
  background: linear-gradient(to bottom, rgb(67, 67, 67,0.8),rgba(255,255,255,0),rgba(255,255,255,0),rgba(255,255,255,0),rgba(255,255,255,0)); 
}

.story-img-container{
  position:absolute;
  top: 50%;
  transform: translate(0, -50%);
  /* background-color: red; */
  width:100%;
  background-size: cover;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  background-repeat: no-repeat;
  background-size: cover;
  
}



.story-txt-container{
  position:absolute;
  width:92%;
  left:0;
  top:60%;
  background-color: rgba( 255, 255, 255, 0.9 );
  padding: 4%;
}
.story-txt{
  font-size: 2.6vh;
  text-size-adjust: auto;
  line-height: 1.6em;
  word-spacing: 0.2px;
  letter-spacing: 0.2px;
  overflow: hidden;
  word-break: break-all;
  word-wrap: break-word;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical; 
  display: -webkit-box;
  -webkit-line-clamp: 7;
  font-family: 'Noto Sans KR', sans-serif;
}
/* .story-img{
  width:100%;
} */
/* .progress-tab{
  position: absolute;
  z-index: 5000;
} */
.press {
  position:absolute;
  top:4%;
  left:3.5%;
  /* background-color: red; */
  z-index: 9999;
  flex-direction: row;
  display: flex;
  
}
.news-profile{
  top:0;
  left:0;
  width:4vh;
  height:4vh;
  border-radius: 50%;
  background-size: cover;
  cursor: pointer;
  overflow: hidden;
}

.press-txt-container{
  top:0;
  left:0;
  margin-left: 1vh;
  height:4vh;
  display: flex;
  align-items: center;
  /* justify-content: center;
  align-items: center; */
  /* background-color: pink; */
  
}

.press-txt{
  position:relative;
  color: white;
  /* background-color: blue; */
  letter-spacing: 0.5px;
  font-size: 1.46vh;
  /* font-weight: bold; */
  cursor: pointer;
}

.icons{
  position:absolute;
  top:4.5%;
  right:4.5%;
  z-index: 9999;
  flex-direction: row;
  display: flex;
}

.like{
  top:0;
  left:0;
  width:2.5vh;
  height:2.5vh;
  background-size: cover;
  cursor: pointer;
}

.like[data-active="true"] {
}

.like:hover{
  opacity: 0.5;
}

.more-info{
  top:0;
  margin-left:1.2vh;
  width:2.5vh;
  height:2.5vh;
  background-size: cover;
  cursor: pointer;
}

.progress-bar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 10px;
  position: absolute;
  top: 0;
  z-index: 9999;
}

.progress-bar-segment {
  height: 2px;
  width: 30px; /* 혹은 전체 길이에 맞게 조절 */
  background-color: white;
  margin: 0 2px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.progress-bar-segment.active {
  opacity: 1;
}

.slide-transition {
  animation: slideEffect 0.3s;
}

@keyframes slideEffect {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = cssStyles;
document.head.appendChild(styleSheet);

// FastAPI 서버에서 데이터를 가져오는 함수
async function fetchCategories() {
  try {
    const response = await fetch('http://127.0.0.1:8000/rss');
    if (!response.ok) {
      throw new Error('네트워크 응답 없음');
    }
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('에러 페칭 데이터:', error);
  }
}

async function fetchBreaking() {
  try {
    const response = await fetch('http://127.0.0.1:8000/rss2');
    if (!response.ok) {
      throw new Error('네트워크 응답 없음');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('에러 페칭 데이터:', error);
  }
}

// 서버에서 데이터를 가져와 UI를 구성하는 함수
function initializeExtension() {
  fetchCategories().then(categories => {
    if (categories) {
      createStoriesContainer(categories);
    }
  });
  fetchBreaking().then(breaking_data => {
    if (breaking_data) {
      createFeedContainer(breaking_data);
    }
  });
}


const instaStorySelector = 'main > :first-child > :first-child > :first-child > :first-child';
const instaFeedSelector = 'main > :first-child > :first-child > :first-child > :nth-child(2)';
const instaStoryWrap = document.querySelector(instaStorySelector);
const instaFeedWrap = document.querySelector(instaFeedSelector);


// 카테고리 컨테이너 생성 및 표시
function createStoriesContainer(categories) {
  let new_categories = [];
  categories.map((category, categoryIndex) => {
    if(category.name == 'ECONOMY' || category.name == 'ENTERTAIN' || category.name == 'SPORTS' || category.name == 'POLITICS' || category.name == 'IT'){
      new_categories.push(category);
    }
  });
  categories = new_categories;


  instaStoryWrap.style.marginBottom = '3%';
  

  const categoryContainer = document.createElement('div');
  // categoryContainer.setAttribute('style','margin-bottom:2%;')
  categoryContainer.setAttribute('style', 'margin-bottom: var(--desktop-story-tray-bottom-margin-denser);')

  categories.map((category, categoryIndex) => {
    const storiesContainer = document.createElement('div');
    storiesContainer.classList.add('stories-container');
    const categoryName = document.createElement('div');
    const categoryNameImg = document.createElement('img');
    if(category.name == 'ECONOMY'){
      categoryNameImg.setAttribute('src', economyImageUrl)
    } else if(category.name == 'ENTERTAIN'){
      categoryNameImg.setAttribute('src', entertainmentImageUrl)
    } else if(category.name == 'IT'){
      categoryNameImg.setAttribute('src', itImageUrl)
    } else if(category.name == 'POLITICS'){
      categoryNameImg.setAttribute('src', politicsImageUrl)
    } else if(category.name == 'SPORTS'){
      categoryNameImg.setAttribute('src', sportsImageUrl)
    }
  
    categoryName.classList.add('category-name');
    categoryName.appendChild(categoryNameImg);
    storiesContainer.appendChild(categoryName);

    category.data.map((profile, profileIndex) => {
      const content = document.createElement('div');
      content.classList.add("content");

      const img = document.createElement('img');
      img.setAttribute('src', categories[categoryIndex].data[profileIndex].avatar);
      storiesContainer.appendChild(content);
      content.appendChild(img);

      content.addEventListener('click', () => {
        content.classList.add('content-selected');

        displayModal(categories, categoryIndex, profileIndex, index = 0);
      });

    });
    categoryContainer.appendChild(storiesContainer);
  });


  instaStoryWrap.parentNode.insertBefore(categoryContainer, instaFeedWrap);

}

function createFeedContainer(breaking_data){
  let pressImg = ''
  if(breaking_data[0].press == '한국경제'){
    pressImg = hankukImageUrl
  } else if(breaking_data[0].press == '동아일보'){
    pressImg = dongAImageUrl
  } else if(breaking_data[0].press == '머니투데이'){
    pressImg = mtImageUrl
  } else if(breaking_data[0].press == '세계일보'){
    pressImg = segyeImageUrl
  } else if(breaking_data[0].press == '한겨레'){
    pressImg = haniImageUrl
  } 

  function calculateTimeDiff(pubDate) {
    const now = new Date();
    const publishedDate = new Date(pubDate);
    const diffInSeconds = Math.floor((now - publishedDate) / 1000);
  
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
  
    if (hours > 0) return hours + "시간 전";
    if (minutes > 0) return minutes + "분 전";
    return seconds + "초 전";
  }

  // 게시물 데이터 객체
  const postData = {
    profileImage: pressImg,
    username: breaking_data[0].press,
    link: breaking_data[0].url,
    postImage: breaking_data[0].image,
    description: breaking_data[0].press,
    content: breaking_data[0].title+'<br/>'+breaking_data[0].passage,
    timestamp: calculateTimeDiff(breaking_data[0].pub_date)
  };

  const firstChild = instaFeedWrap.firstChild.firstChild.firstChild.firstChild;
  // 게시물을 생성하고 화면에 추가하는 함수
  function createPost(data) {

    // 게시물 div 요소 생성
    const postArticle = document.createElement("article");
    postArticle.classList.add("post");

    // 게시물 내용 생성
    postArticle.innerHTML = `
        <div class="post-header">
            <div class="header-profile" style="position:relative;display:flex;flex-direction:row;">
                <div style="maring-top:10px;">
                    <img src="${data.profileImage}" alt="Profile" class="profile-pic">
                </div>
                <div style="height:100%;margin-top:6px;">
                    <span class="username" style="font-family: var(--font-family-system);font-size: var(--system-14-font-size);
                    line-height: var(--system-14-line-height);font-weight: var(--font-weight-system-semibold);">${data.username}</span>
                </div>
                <div style="position:absolute;right:0;top:0;margin-top:10px;"><a href="${data.link}" target="_blank"><img src="${dotsImageUrl}" class="dots-img" width="15" height="15"></a></div>
                <div>
                  
                </div>
            </div>
        </div>
        <img src="${data.postImage}" alt="Post" class="post-image">
        <div class="post-footer" style="margin-top:20px;">
            <p class="description" style="font-family: var(--font-family-system);font-size: .875rem;margin-top:10px;"><strong>${data.description}</strong> ${data.content}</p>
            <p class="timestamp">${data.timestamp}</p>
        </div>
    `;

    // 게시물을 화면에 추가
    firstChild.parentNode.insertBefore(postArticle, firstChild);
  }

  // 초기 게시물 생성
  createPost(postData);
}







function displayModal(categories, categoryIndex, profileIndex, index) {
    let current = {
    categoryIndex: categoryIndex,
    profileIndex: profileIndex,
    index: index
  };

  // 모달 생성
  const modal = document.createElement('div');
  modal.classList.add('modal');

  // 로고 생성
  const logo = document.createElement('div');
  logo.classList.add('logo');
  logo.textContent = 'NewStory';
  modal.appendChild(logo);

  // 왼쪽 버튼 생성
  const leftArrow = document.createElement('div');
  leftArrow.classList.add('left-arrow', 'arrow');

  const leftArrowImg = document.createElement('img');
  leftArrowImg.classList.add('left-arrow-img');
  leftArrowImg.src = backImageUrl;
  leftArrowImg.setAttribute('width', '100%');
  leftArrowImg.setAttribute('height', '100%');
  leftArrow.appendChild(leftArrowImg);

  modal.appendChild(leftArrow);

  // 아우터 윈도우 생성
  const outerWindow = document.createElement('div');
  outerWindow.classList.add('outer-window');

  // 스토리 래퍼 생성
  const storyWrapper = document.createElement('div');
  storyWrapper.classList.add('story-wrapper');


  // 스토리 컨테이너 생성
  const storyContainer = document.createElement('div');
  storyContainer.classList.add('story-container');

  // 터치 컨테이너 생성
  const touchContainer = document.createElement('div');
  touchContainer.classList.add('touch-container');

  // 왼쪽 및 오른쪽 터치 영역 생성
  const leftTouch = document.createElement('div');
  leftTouch.classList.add('left-touch', 'touch');
  const rightTouch = document.createElement('div');
  rightTouch.classList.add('right-touch', 'touch');
  touchContainer.appendChild(leftTouch);
  touchContainer.appendChild(rightTouch);

  // 컨텐츠 컨테이너 생성
  const contentContainer = document.createElement('div');
  contentContainer.classList.add('content-container');

  // 스토리 이미지 컨테이너 생성
  const storyImgContainer = document.createElement('div');
  storyImgContainer.classList.add('story-img-container');
  const storyImg = document.createElement('img');
  storyImg.classList.add('story-img');
  storyImg.src = categories[current.categoryIndex].data[current.profileIndex].storyData[0].img;
  storyImg.setAttribute('width', '100%');
  // storyImg.setAttribute('height', '100%');
  storyImgContainer.appendChild(storyImg);


  // 스토리 텍스트 컨테이너 생성
  const storyTxtContainer = document.createElement('div');
  storyTxtContainer.classList.add('story-txt-container');
  const storyTxt = document.createElement('span');
  storyTxt.classList.add('story-txt');
  storyTxt.textContent = categories[current.categoryIndex].data[current.profileIndex].storyData[current.index].text;
  storyTxtContainer.appendChild(storyTxt);

  // 프로그레스 바 컨테이너 생성
  const progressBarContainer = document.createElement('div');
  progressBarContainer.classList.add('progress-bar-container');

  // 프레스 섹션 생성
  const press = document.createElement('div');
  press.classList.add('press');

  const newsProfile = document.createElement('div');
  newsProfile.classList.add('news-profile');

  const pressImg = document.createElement('img');
  pressImg.classList.add('press-img');
  if(categories[current.categoryIndex].data[current.profileIndex].press == '한국경제'){
    pressImg.src = hankukImageUrl;
  } else if(categories[current.categoryIndex].data[current.profileIndex].press == '동아일보'){
    pressImg.src = dongAImageUrl;
  } else if(categories[current.categoryIndex].data[current.profileIndex].press == '머니투데이'){
    pressImg.src = mtImageUrl;
  } else if(categories[current.categoryIndex].data[current.profileIndex].press == '세계일보'){
    pressImg.src = segyeImageUrl;
  } else if(categories[current.categoryIndex].data[current.profileIndex].press == '한겨레'){
    pressImg.src = haniImageUrl;
  }
  pressImg.setAttribute('width', '100%');
  pressImg.setAttribute('height', '100%');
  newsProfile.appendChild(pressImg);

  const pressTxtContainer = document.createElement('div');
  pressTxtContainer.classList.add('press-txt-container');
  const pressTxt = document.createElement('span');
  pressTxt.classList.add('press-txt');
  pressTxt.textContent = categories[current.categoryIndex].data[current.profileIndex].press;
  pressTxtContainer.appendChild(pressTxt);
  press.appendChild(newsProfile);
  press.appendChild(pressTxtContainer);

  // 아이콘 섹션 생성
  const icons = document.createElement('div');
  icons.classList.add('icons');

  const like = document.createElement('div');
  like.classList.add('like');
  

  const likeImg = document.createElement('img');
  likeImg.classList.add('like-img');
  likeImg.setAttribute('data-active', 'false');
  likeImg.src = starImageUrl;
  likeImg.setAttribute('width', '100%');
  likeImg.setAttribute('height', '100%');
  like.appendChild(likeImg);

  const moreInfo = document.createElement('div');
  moreInfo.classList.add('more-info');

  const moreInfoImg = document.createElement('img');
  moreInfoImg.classList.add('more-info-img');

  moreInfoImg.src = moreImageUrl;
  moreInfoImg.setAttribute('width', '100%');
  moreInfoImg.setAttribute('height', '100%');
  moreInfo.appendChild(moreInfoImg);

  icons.appendChild(like);
  icons.appendChild(moreInfo);

  moreInfo.addEventListener('click', function () {
    const newsUrl = categories[current.categoryIndex].data[current.profileIndex].url;
    const title = categories[current.categoryIndex].data[current.profileIndex].title;
    const keyword = categories[current.categoryIndex].data[current.profileIndex].keyword;
    showPopupWithImageUrl(title, newsUrl, keyword);
    stopTimer();
  });

  // 모든 요소를 스토리 컨테이너에 추가
  storyContainer.appendChild(touchContainer);
  storyContainer.appendChild(contentContainer);
  contentContainer.appendChild(storyImgContainer);
  contentContainer.appendChild(storyTxtContainer);
  storyContainer.appendChild(progressBarContainer);
  storyContainer.appendChild(press);
  storyContainer.appendChild(icons);

  // 스토리 래퍼에 스토리 컨테이너 추가
  storyWrapper.appendChild(storyContainer);

  // 아우터 윈도우에 스토리 래퍼 추가
  outerWindow.appendChild(storyWrapper);

  // 모달에 아우터 윈도우 추가
  modal.appendChild(outerWindow);

  // 오른쪽 버튼 생성
  const rightArrow = document.createElement('div');
  rightArrow.classList.add('right-arrow', 'arrow');

  const rightArrowImg = document.createElement('img');
  rightArrowImg.classList.add('right-arrow-img');
  rightArrowImg.src = nextImageUrl;
  rightArrowImg.setAttribute('width', '100%');
  rightArrowImg.setAttribute('height', '100%');
  rightArrow.appendChild(rightArrowImg);

  modal.appendChild(rightArrow);

  // 닫기 버튼 생성
  const close = document.createElement('div');
  close.classList.add('close');
  const closeImg = document.createElement('img');
  closeImg.classList.add('close-img');
  closeImg.src = closeImageUrl;
  closeImg.setAttribute('width', '25px');
  closeImg.setAttribute('height', '25px');
  close.appendChild(closeImg);
  modal.appendChild(close);

  // 모달을 body에 추가
  document.body.appendChild(modal);

    //윈도우 사이즈 설정
  function adjustOuterWindow() {
    const outerWindow = document.querySelector('.outer-window');
    const windowRatio = window.innerHeight / window.innerWidth;
    const aspectRatio = 16 / 9;
    if (window.innerHeight < window.innerWidth) {
      // 브라우저 높이를 기준으로 너비 조정
      outerWindow.style.height = '96%';
      outerWindow.style.width = windowWidth = ((window.innerHeight * 0.96) / aspectRatio) + 'px';
    } else if (windowRatio < aspectRatio) {
      outerWindow.style.height = '90%';
      outerWindow.style.width = windowWidth = ((window.innerHeight * 0.9) / aspectRatio) + 'px';
    } else {
      // 브라우저 너비를 기준으로 높이 조정
      outerWindow.style.width = '60%';
      outerWindow.style.height = windowHeight = ((window.innerWidth * 0.6) * aspectRatio) + 'px';
    }

  }
  window.addEventListener('resize', adjustOuterWindow);
  adjustOuterWindow();

  function createProgressBarsForAllContainers(length) {
    const progressBarContainers = document.querySelectorAll('.progress-bar-container');
    progressBarContainers.forEach(container => {
      container.innerHTML = ''; // 기존의 프로그레스 바를 지웁니다.
      const progressBars = [];
      const containerWidth = container.clientWidth;
      const segmentWidth = (containerWidth / length) - (6 * (length - 1));

      for (let i = 0; i < length; i++) {
        const bar = document.createElement('div');
        bar.classList.add('progress-bar-segment');
        bar.style.width = `${segmentWidth}px`;
        container.appendChild(bar);
        progressBars.push(bar);

        // 첫 번째 바에 대한 처리: 색상 변경
        if (i === 0) {
          for (let i = 0; i <= current.index; i++) {
            bar.classList.add('active');
          }

        }
      }
    });
  }

  // 윈도우 크기가 변경될 때마다 모든 프로그레스 바 업데이트
  window.addEventListener('resize', () => {
    createProgressBarsForAllContainers(3); // 여기서 3은 세그먼트의 개수입니다.
  });

  // 초기 프로그레스 바 생성
  createProgressBarsForAllContainers(3);

  function updateProgressBar(currentIndex) {
    const progressBarSegments = document.querySelectorAll('.progress-bar-segment');
    progressBarSegments.forEach((segment, index) => {
      segment.classList.toggle('active', index <= currentIndex);
    });
  }


  let storyTimer; // 타이머 변수 추가

  // 타이머를 초기화하고 시작하는 함수
  function resetTimer() {
    clearTimeout(storyTimer); // 이전 타이머 제거
    storyTimer = setTimeout(() => {
      // 타이머가 만료되면 자동으로 다음 스토리로 전환
      const currentProfileStories = categories[current.categoryIndex].data[current.profileIndex].storyData;
      if (current.index < currentProfileStories.length - 1) {
        current.index++;
      } else if (current.profileIndex < categories[current.categoryIndex].data.length - 1) {
        current.profileIndex++;
        current.index = 0;
      } else {
        // 마지막 프로필의 마지막 스토리에서 모달 제거
        modal.remove();
        return;
      }
      updateStory();
      // 타이머가 만료되면 다시 타이머를 시작합니다.
      resetTimer();
    }, 3000); // 3초 타이머 설정
  }

  function stopTimer() {
    clearTimeout(storyTimer); // 타이머 중지
  }
  // 최초 시작시 스토리 타이머 시작
  resetTimer();

  
  function updateStory() {
    const currentProfileStories = categories[current.categoryIndex].data[current.profileIndex].storyData;
    const story = currentProfileStories[current.index];
    const press = categories[current.categoryIndex].data[current.profileIndex].press;

    // 프로그레스 바 업데이트
    updateProgressBar(current.index);

    // 프레스 이미지 업데이트
    if(press == '한국경제') {
      pressImg.src = hankukImageUrl;
    } else if(press == '동아일보') {
      pressImg.src = dongAImageUrl;
    } else if(press == '머니투데이') {
      pressImg.src = mtImageUrl;
    } else if(press == '세계일보') {
      pressImg.src = segyeImageUrl;
    } else if(press == '한겨레') {
      pressImg.src = haniImageUrl;
    }

    pressTxt.textContent = press;

    storyImg.src = story.img;
    
    storyTxt.textContent = story.text;
  }


  // 왼쪽 버튼 클릭 이벤트 리스너
  leftArrow.addEventListener('click', function () {
    if (current.index > 0) {
      // 이전 스토리로 이동
      current.index--;
      resetTimer(); // 왼쪽 버튼 클릭 시 타이머 재설정
      updateStory();
    } else if (current.profileIndex > 0) {
      // 이전 프로필의 마지막 스토리로 이동
      current.profileIndex--;
      current.index = categories[current.categoryIndex].data[current.profileIndex].storyData.length - 1;
      resetTimer(); // 왼쪽 버튼 클릭 시 타이머 재설정
      updateStory();
    }
  });

  // 오른쪽 버튼 클릭 이벤트 리스너
  rightArrow.addEventListener('click', function () {
    const currentProfileStories = categories[current.categoryIndex].data[current.profileIndex].storyData;
    if (current.index < currentProfileStories.length - 1) {
      // 다음 스토리로 이동
      current.index++;
      resetTimer(); // 오른쪽 버튼 클릭 시 타이머 재설정
      updateStory();
    } else if (current.profileIndex < categories[current.categoryIndex].data.length - 1) {
      // 다음 프로필의 첫 스토리로 이동
      current.profileIndex++;
      current.index = 0;
      resetTimer(); // 오른쪽 버튼 클릭 시 타이머 재설정
      updateStory();
    } else {
      // 마지막 프로필의 마지막 스토리에서 모달 제거
      modal.remove();
      return;
    }
  });


  // 다음 카테고리로 이동하는 함수
  function moveToNextCategory() {
    if (current.categoryIndex < categories.length - 1) {
      current.categoryIndex++;
    } else {
      return;
    }
    current.profileIndex = 0;
    current.index = 0;
    resetTimer();
    updateStory();
  }

  // 이전 카테고리로 이동하는 함수
  function moveToPreviousCategory() {
    if (current.categoryIndex > 0) {
      current.categoryIndex--;
    } else {
      return;
    }
    current.profileIndex = 0;
    current.index = 0;
    resetTimer();
    updateStory();
  }

  // 키보드 이벤트 리스너 추가
  function handleKeyPress(event) {
    if (event.key === 'ArrowUp') {
      moveToPreviousCategory();
    } else if (event.key === 'ArrowDown') {
      moveToNextCategory();
    }
  }

  document.addEventListener('keydown', handleKeyPress);


  // 모달 제거 시 키보드 이벤트 리스너 제거
  const removeEventListener = () => {
    document.removeEventListener('keydown', handleKeyPress);
  };


  // 닫기 버튼 클릭 이벤트 리스너
  close.addEventListener('click', function () {
    modal.remove();
    stopTimer(); // 모달 닫을 때 타이머 재시작
    removeEventListener(); // 이벤트 리스너 제거
  });

  // more-info 클릭 이벤트 처리
  function showPopupWithImageUrl(title, newsUrl, keyword) {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    popup.style.zIndex = '10000';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.alignItems = 'center'; // 요소들을 중앙으로 정렬

    const newsTitle = document.createElement('span');
    newsTitle.textContent = title;
    newsTitle.style.marginBottom = '20px';
    newsTitle.style.fontSize = '17px';

    const newsLink = document.createElement('a');
    newsLink.href = newsUrl; // 이미지 주소를 링크로 설정
    newsLink.textContent = newsUrl;
    newsLink.target = "_blank"; // 새 탭에서 링크 열기
    newsLink.style.marginBottom = '10px';

    const newsKeyword = document.createElement('span');
    newsKeyword.textContent = keyword;
    newsKeyword.style.marginBottom = '10px';

    popup.appendChild(newsTitle);
    popup.appendChild(newsLink);
    popup.appendChild(newsKeyword);



    const closeButton = document.createElement('button');
    closeButton.textContent = '닫기';
    closeButton.onclick = () => {
      popup.remove(); // 팝업 창 닫기
      resetTimer(); // 타이머를 다시 시작합니다.
    };
    popup.appendChild(closeButton);

    document.body.appendChild(popup);


}

  

}



// 확장 프로그램 초기화
initializeExtension();
