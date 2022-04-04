const fs = require('fs');
const fetch = require('node-fetch');
const pLimit = require('p-limit');
const roomMap = require('../public/roomMap.json');
const limit = pLimit(20);

const run = async () => {
  // const categories = getAllSubcategories(catalog);
  const categories = Object.values(roomMap)
    .map(ranks => ranks.map(({ rankingId }) => rankingId))
    .flat();
  const data = await Promise.all(
    categories.map(async (category, index) =>
      limit(async () => {
        try {
          const resp = await fetch(`https://www.ikea.cn/api-host/content/ranking/${category}`);
          const data = await resp.json();
          const {products} = data;
          if (Array.isArray(products)) {
            // filter all discount products
            return {...data, products: products.filter(product => product.price.breathTaking === true)};
          }
          return {};
        } catch (error) {
          console.log(error);
          return {};
        }
      })
    )
  );
  fs.writeFileSync(__dirname + '/../public/data.json', JSON.stringify(data.flat()));
};

run();
