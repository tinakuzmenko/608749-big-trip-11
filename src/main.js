import API from './api/api.js';
import Store from './api/store.js';
import Provider from './api/provider.js';
import ButtonAddNewEventComponent from './components/page-header/button-add-new-event.js';
import FilterController from './controllers/filter.js';
import LoadingComponent from './components/loading.js';
import LoadErrorComponent from './components/load-error.js';
import PageHeaderContainerComponent from './components/page-header/page-header-container.js';
import PageNavigationComponent from './components/page-header/page-navigation.js';
import TripCostComponent from './components/page-header/trip-cost.js';
import TripRouteComponent from './components/page-header/trip-route.js';
import TripEventsModel from './models/trip-events.js';
import TripEventsBoardComponent from './components/page-main/trip-events/trip-event-board.js';
import TripEventsBoardController from './controllers/trip-events-board.js';
import TripStatisticsComponent from './components/page-main/trip-statistics/trip-statistics.js';
import {RenderPosition, TripDataTab} from "./helpers/constants.js";
import {render, remove} from './helpers/render.js';

const AUTHORIZATION = `Basic y2StXBzjFLjF18cFElf5tl5HDxgg7rjm`;
const STORE_PREFIX = `big-trip-localstorage`;
const STORE_VER = `v1`;
const STORE_NAME = `${STORE_PREFIX}-${STORE_VER}`;

const tripMain = document.querySelector(`.trip-main`);
const pageBodyContainer = document.querySelector(`main .page-body__container`);
const tripControls = tripMain.querySelector(`.trip-controls`);
const firstTitle = tripControls.querySelector(`h2`);

const api = new API(AUTHORIZATION);
const store = new Store(STORE_NAME, window.localStorage);
const apiWithProvider = new Provider(api, store);
const tripEventsModel = new TripEventsModel();
const pageHeaderContainerComponent = new PageHeaderContainerComponent();
const pageNavigationComponent = new PageNavigationComponent();
const loadingComponent = new LoadingComponent();
const loadErrorComponent = new LoadErrorComponent();
const filterController = new FilterController(tripControls, tripEventsModel);
const buttonAddNewEventComponent = new ButtonAddNewEventComponent(tripEventsModel);
const tripEventsBoardComponent = new TripEventsBoardComponent();
const tripEventsBoardController = new TripEventsBoardController(tripEventsBoardComponent, tripEventsModel, apiWithProvider);
const tripStatisticsComponent = new TripStatisticsComponent(tripEventsModel);

render(tripMain, pageHeaderContainerComponent, RenderPosition.AFTERBEGIN);
render(firstTitle, pageNavigationComponent, RenderPosition.AFTEREND);
render(tripMain, buttonAddNewEventComponent);
render(pageBodyContainer, loadingComponent);
render(pageBodyContainer, tripEventsBoardComponent);
render(pageBodyContainer, tripStatisticsComponent);

const tripInfoContainer = tripMain.querySelector(`.trip-info`);
const tripCostComponent = new TripCostComponent(tripInfoContainer, tripEventsModel);
const tripRouteComponent = new TripRouteComponent(tripInfoContainer, tripEventsModel);

filterController.render();
buttonAddNewEventComponent.setClickHandler();
buttonAddNewEventComponent.getElement().disabled = true;
tripStatisticsComponent.hide();

pageNavigationComponent.setChangeHandler((menuItem) => {
  switch (menuItem) {
    case TripDataTab.STATS:
      pageNavigationComponent.setActiveItem(menuItem);
      tripEventsBoardController.hide();
      tripStatisticsComponent.show();
      break;
    case TripDataTab.TABLE:
      pageNavigationComponent.setActiveItem(menuItem);
      tripStatisticsComponent.hide();
      tripEventsBoardController.show();
      break;
  }
});

apiWithProvider.getData()
  .then((data) => {
    tripEventsModel.setOffers(data.offers);
    tripEventsModel.setDestinations(data.destinations);
    tripEventsModel.setTripEvents(data.tripEvents);
  })
  .then(() => {
    remove(loadingComponent);
    buttonAddNewEventComponent.getElement().disabled = false;
    tripRouteComponent.render();
    tripCostComponent.render();
    tripEventsBoardController.render();
  });
// .catch(() => {
//   remove(loadingComponent);
//   render(pageBodyContainer, loadErrorComponent);
// });

window.addEventListener(`load`, () => {
  navigator.serviceWorker.register(`/sw.js`);
});

window.addEventListener(`online`, () => {
  document.title = document.title.replace(` [offline]`, ``);
  apiWithProvider.sync();
});

window.addEventListener(`offline`, () => {
  document.title += ` [offline]`;
});
