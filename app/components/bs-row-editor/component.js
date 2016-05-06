import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['row', 'bs-row-editor'],
  eventBus: Ember.inject.service(),

  // insert a card either at the begining
  // or before/after the target card
  _insertCard(card, targetCard, insertAfter) {
    const cards = this.get('model.cards');
    // where to insert?
    // default to the begining (left)
    let pos = 0;
    if (targetCard) {
      // if inserting before, use target card's current index
      // otherwise (inserting after) use the next index
      pos = cards.indexOf(targetCard) + (insertAfter ? 1 : 0);
    }
    cards.insertAt(pos, card);
  },

  dragOver(event){
    //inform the DOM this is a drop target
    return false;
  },
  drop(event){
    console.log('bs-row-editor for ' + this.get('elementId') + ' caught drop');
    // TODO: are we adding a card or moving a card?
    // for now only adding
    // where to place the card?
    let eventBus = this.get('eventBus');
    let targetCard, insertAfter;
    let dropCardInfo = eventBus.get('dropCardInfo');
    if (dropCardInfo) {
      targetCard = dropCardInfo.card;
      insertAfter = dropCardInfo.insertAfter;
    }
    // TODO: what size should it be?
    let newCard = {
      "width":4,
      "height": 4,
      "component": {"name": "placeholder-card"}
    };
    // insert the card
    this._insertCard(newCard, targetCard, insertAfter);
    // clear event bus state
    eventBus.set('dropCardInfo', null);
  }
});
