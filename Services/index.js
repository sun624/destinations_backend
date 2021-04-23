const axios = require("axios");

if(!process.env.PORT) {
  require("../Secrets");
}

function getUID() {
  let uid = "";
  for (let i = 0; i < 6; i++) {
    const rand = Math.floor(Math.random() * 10);
    uid += rand;
  }

  return uid;
}

async function getPhotoFromUnsplash(name) {



  let URL = `https://api.unsplash.com/search/photos?client_id=${process.env.UNSPLASH_API_KEY}&page=1&query=${name}`;

  const fallBackUrl =
    "https://cavchronicle.org/wp-content/uploads/2018/03/top-travel-destination-for-visas-900x504.jpg";

  const res = await axios.get(URL);
  const photo = res.data.results;
  if (photo.length === 0) {
    return fallBackUrl;
  }
  const rand = Math.floor(Math.random() * 10);
  return photo[rand].urls.small;
}
module.exports = { 
    getUID, 
    getPhoto: getPhotoFromUnsplash 
};
