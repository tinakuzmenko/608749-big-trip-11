import {getRandomIntegerNumber, getRandomArrayItem} from '../helpers/utils.js';

const getRandomOffers = (offers) => {
  const offersAmount = getRandomIntegerNumber(0, offers.length - 1);
  const randomOffers = [];

  for (let i = 0; i < offersAmount; i++) {
    const offer = getRandomArrayItem(offers);
    if (randomOffers.indexOf(offer) === -1) {
      randomOffers.push(offer);
    }
  }

  return randomOffers;
};

export {getRandomOffers};
