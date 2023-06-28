const axios = require('axios');
const cheerio = require('cheerio');

// 유튜브 웹사이트에서 추천된 영상 크롤링
async function scrapeRecommendedVideos() {
  try {
    const response = await axios.get('https://www.youtube.com');
    const $ = cheerio.load(response.data);

    // 추천된 영상 요소 선택 및 정보 추출
    const recommendedVideoElements = $('ytd-video-renderer');
    const recommendedVideos = recommendedVideoElements.map((index, element) => {
      const title = $(element).find('#video-title').text().trim();
      const videoId = $(element).find('#video-title').attr('href').split('=')[1];
      const thumbnail = $(element).find('#thumbnail').attr('src');

      return {
        title,
        videoId,
        thumbnail,
      };
    }).get();

    return recommendedVideos;
  } catch (error) {
    console.error('Error scraping recommended videos:', error);
    throw error;
  }
}

module.exports = {
  scrapeRecommendedVideos,
};