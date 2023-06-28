const puppeteer = require('puppeteer');

// 페이지의 끝까지 스크롤하는 함수
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// 유튜브 웹사이트에서 추천된 영상 크롤링
async function scrapeRecommendedVideos() {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('https://www.youtube.com', { waitUntil: 'networkidle0' });
    await autoScroll(page);  // 페이지의 끝까지 스크롤

    await page.waitForFunction(() => {
      const thumbnailElements = Array.from(document.querySelectorAll('.ytd-thumbnail img'));
      const validThumbnails = thumbnailElements.filter(el => el.src && el.src.trim() !== '');
      return validThumbnails.length >= 8;  // 유효한 썸네일 이미지가 8개 이상 로딩되었는지 확인
    }, {timeout: 60000});
    

    // 추천된 영상 요소 선택 및 정보 추출
    let recommendedVideos = await page.evaluate(() => {
      const videoElements = Array.from(document.querySelectorAll('#contents ytd-rich-item-renderer'));
      return videoElements.map((element) => {
        const titleElement = element.querySelector('#video-title-link');
        const thumbnailElement = element.querySelector('.ytd-thumbnail img');

        const title = titleElement ? titleElement.textContent.trim() : null;
        const videoId = titleElement ? titleElement.href.split('=')[1] : null;
        const thumbnail = thumbnailElement ? thumbnailElement.src : null;

        return {
          title,
          videoId,
          thumbnail,
        };
      });
    });

    recommendedVideos = recommendedVideos.filter(video => video.title !== null && video.videoId !== null);

    console.log("scrapped?");
    console.log(recommendedVideos); // 크롤링한 데이터를 콘솔에 출력

    await browser.close();

    return recommendedVideos;
  } catch (error) {
    console.error('Error scraping recommended videos:', error);
    throw error;
  }
}


module.exports = {
  scrapeRecommendedVideos,
};