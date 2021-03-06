import TripDaysContainer from '../components/page-main/trip-days/trip-days-container.js';
import NoTripEventsComponent from '../components/page-main/trip-events/no-trip-events.js';
import TripEventsGroupedByDaysView from '../components/page-main/trip-events/trip-events-grouped-by-days.js';
import TripEventsView from '../components/page-main/trip-events/trip-events.js';
import TripSortComponent from '../components/page-main/trip-sort/trip-sort.js';
import {FilterType, SortType} from '../helpers/constants.js';
import {render} from '../helpers/render.js';
import {getSortedTripEvents} from '../helpers/utils.js';

export default class TripEventsBoardController {
  constructor(container, tripEventsModel, api) {
    this._containerComponent = container;
    this._tripEventsModel = tripEventsModel;
    this._api = api;

    this._container = this._containerComponent.getElement();
    this._tripDaysContainer = new TripDaysContainer().getElement();
    this._sortComponent = new TripSortComponent();
    this._sortType = SortType.EVENT;

    this._dataChangeHandler = this._dataChangeHandler.bind(this);
    this._filterTypeChangeHandler = this._filterTypeChangeHandler.bind(this);
    this._creatingNewEventModeChangeHandler = this._creatingNewEventModeChangeHandler.bind(this);
    this._sortTypeChangeHandler = this._sortTypeChangeHandler.bind(this);

    this._sortComponent.setSortTypeChangeHandler(this._sortTypeChangeHandler);
    this._tripEventsModel.setFilterChangeHandler(this._filterTypeChangeHandler);
    this._tripEventsModel.setModeChangeHandler(this._creatingNewEventModeChangeHandler);
  }

  render() {
    this._sortedTripEvents = getSortedTripEvents(this._tripEventsModel.getTripEvents(), this._sortType);
    this._offers = this._tripEventsModel.getOffers();
    this._destinations = this._tripEventsModel.getDestinations();

    this._clear();

    if (!this._sortedTripEvents.length) {
      this._tripEventsView = new NoTripEventsComponent(this._container, this._sortedTripEvents, this._offers, this._destinations, this._dataChangeHandler, this._tripEventsModel);
      render(this._container, this._tripEventsView);

      return;
    }

    render(this._container, this._sortComponent);
    this._switchSortType();
  }

  hide() {
    this._containerComponent.hide();
    this._setDefaultMode();
  }

  show() {
    this._containerComponent.show();
    this._sortComponent.rerender();
    this.render();
  }

  _setDefaultMode() {
    this._sortType = SortType.EVENT;
    this._tripEventsModel.setFilter(FilterType.EVERYTHING);
  }

  _update() {
    this._clear();
    this.render();
  }

  _clear() {
    if (this._container.querySelector(`.trip-days`)) {
      this._container.querySelector(`.trip-days`).innerHTML = ``;
    }

    if (this._container.querySelector(`.trip-events__msg`)) {
      this._container.querySelector(`.trip-events__msg`).remove();
    }
  }

  _switchSortType() {
    this._tripSortItemDayElement = this._sortComponent.getElement().querySelector(`.trip-sort__item--day`);

    switch (this._sortType) {
      case SortType.TIME:
      case SortType.PRICE:
        this._tripSortItemDayElement.textContent = ``;
        this._tripEventsView = new TripEventsView(this._tripDaysContainer, this._sortedTripEvents, this._offers, this._destinations, this._dataChangeHandler);
        render(this._container, this._tripEventsView);
        break;
      default:
        this._tripSortItemDayElement.textContent = `Day`;
        this._tripEventsView = new TripEventsGroupedByDaysView(this._tripDaysContainer, this._sortedTripEvents, this._offers, this._destinations, this._dataChangeHandler, this._tripEventsModel);
        render(this._container, this._tripEventsView);
        break;
    }
  }

  _sortTypeChangeHandler(sortType) {
    this._sortType = sortType;
    this.render();
  }

  _filterTypeChangeHandler() {
    this._sortType = SortType.EVERYTHING;
    this._sortComponent.rerender();
    this.render();
  }

  _creatingNewEventModeChangeHandler() {
    if (!this._tripEventsModel.getIsCreatingMode()) {
      return;
    }

    this._setDefaultMode();
    this._tripEventsView.createNewEventForm();
  }

  _dataChangeHandler(tripEventController, oldTripEvent, updatedTripEvent, isFavorite = false) {
    if (!isFavorite) {
      this._tripEventsModel.setIsButtonNewEventEnabled(false);
    }

    if (oldTripEvent === null) {
      this._createTripEvent(tripEventController, updatedTripEvent);
    } else if (updatedTripEvent === null) {
      this._deleteTripEvent(tripEventController, oldTripEvent);
    } else {
      this._updateTripEvent(tripEventController, oldTripEvent, updatedTripEvent, isFavorite);
    }
  }

  _createTripEvent(tripEventController, updatedTripEvent) {
    this._api.createTripEvent(updatedTripEvent)
    .then((tripEventModel) => {
      this._tripEventsModel.addTripEvent(tripEventModel);
      this._tripEventsModel.setIsCreatingMode();
      this.render();
    })
    .catch(() => {
      tripEventController.shake();
    });
  }

  _deleteTripEvent(tripEventController, oldTripEvent) {
    this._api.deleteTripEvent(oldTripEvent.id)
        .then(() => {
          this._tripEventsModel.removeTripEvent(oldTripEvent.id);
          this._tripEventsModel.setIsButtonNewEventEnabled(true);
          tripEventController.closeFormOnSuccessDelete();
          this.render();
        })
        .catch(() => {
          tripEventController.shake();
          this._tripEventsModel.setIsButtonNewEventEnabled(true);
        });
  }

  _updateTripEvent(tripEventController, oldTripEvent, updatedTripEvent, isFavorite) {
    this._api.updateTripEvent(oldTripEvent.id, updatedTripEvent)
          .then((tripEventModel) => {
            const isSuccess = this._tripEventsModel.updateTripEvent(oldTripEvent.id, tripEventModel, isFavorite);
            tripEventController.render(tripEventModel);

            if (isSuccess && !isFavorite) {
              tripEventController.closeFormOnSuccessSave();
              this._update();
              this._tripEventsModel.setIsButtonNewEventEnabled(true);
            }
          })
          .catch(() => {
            tripEventController.shake();
            this._tripEventsModel.setIsButtonNewEventEnabled(true);
          });
  }
}
