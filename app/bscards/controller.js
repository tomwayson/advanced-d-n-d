import Ember from 'ember';

export default Ember.Controller.extend({

  // this is just used to verify that we're adding new cards
  _lastPlaceHolderCardId: 100,

  eventBus: Ember.inject.service('event-bus'),

  getCardDefaults(cardType) {
    if (cardType === 'placeholder') {
      // increment placeholder id
      this.set('_lastPlaceHolderCardId', this.get('_lastPlaceHolderCardId') + 1);
      return {
        component: {
          name: 'placeholder-card',
          settings: {
            id: this.get('_lastPlaceHolderCardId')
          }
        },
        height: 4,
      };
      // TODO: handle other card types
      } else {
      // TODO: what to do here
      return null;
    }
  },

  actions: {
    onCardDragStart(cardType) {
      const cardModel = this.getCardDefaults(cardType);
      this.get('eventBus').set('transferData.model', cardModel);
    }
  }
});
