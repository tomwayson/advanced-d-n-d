/**
 * bs-row-editor/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['row', 'bs-row-editor'],
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  resizerModel: {},

  onNoCards: Ember.observer('model.cards.length', function(){
    if(this.get('model.cards.length') === 0){
      console.log('cards is empty, sending onRowRemove');
      this.sendAction('onRowRemove', this.get('model'));
    }
  }),

  init(){
    this._super(...arguments);
    this.get('layoutCoordinator').rowComponents.push(this);
  },
  willDestroyElement(){
    //remove the component from the hash
    this.set('layoutCoordinator.rowComponents', this.get('layoutCoordinator.rowComponents').without(this));
  },

  /**
   * Component Position
   * ,top,bottom,right,left,height,width of this component
   * Marked Volatile so it's recomputed when requested
   */
  componentPosition: Ember.computed('model', function(){
    return this.getComponentPosition();
  }).volatile(),

  /**
   * Actually get the component position from the DOM
   * accounting for scroll position
   */
  getComponentPosition(){
    //get the actual Element
    let componentElement = this.$()[0];
    //low-level DOM api for-the-win
    let card = componentElement.getBoundingClientRect();
    //create a json object that accounts for scroll position
    let cp = {
      top: card.top + window.pageYOffset,
      left: card.left + window.pageXOffset,
      bottom: card.bottom + window.pageYOffset,
      right: card.right + window.pageXOffset,
      width: card.width,
      height: card.height
    };
    return cp;
  },

  // insert a card either at the begining
  // or before/after the target card
  insertCard(newCardModel, targetCardModel, dockPosition) {
    //adjust sizes
    let halfWidth = (targetCardModel.width / 2);
    Ember.set(targetCardModel,'width',Math.ceil(halfWidth));
    // set the card width/height based on above calculations
    Ember.set(newCardModel, 'width', Math.floor(halfWidth));
    const cards = this.get('model.cards');
    // where to insert?
    // default to the begining (left)
    let pos = 0;
    if (targetCardModel) {
      // if inserting before, use target card's current index
      // otherwise (inserting after) use the next index
      pos = cards.indexOf(targetCardModel);
      if(dockPosition === 'card-right'){
        pos++;
      }
    }
    cards.insertAt(pos, newCardModel);
  },

  /**
   * Handle actions, bubbling from the cards in the row
   */
  actions: {
    onCardRemove( cardToRemove ) {
      this.sendAction('onCardRemove', cardToRemove, this.get('model'));
    }
  }

});
