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

  // _updateCardResizer(options){
  //   //setup a default model that will hide the resizer
  //   //this allows us to return early out of this function
  //   //which allows us to do less work if short-circuting
  //
  //   let resizerModel = {
  //     visible:false,
  //     position : null,
  //     showRightSizer: false,
  //     showLeftSizer: false,
  //     edge: options.edge
  //   };
  //
  //   if(!options.visible){
  //     console.log('onUpdateCardResizer:hiding resizer...');
  //     this.set('resizerModel', resizerModel);
  //     return;
  //   }
  //
  //   //Scenarios
  //   //- if both cards.width > min-width
  //   //  - show bi-directional
  //   //- if right-card = min-width
  //   //  - show left-only splitter
  //   //- if left-card = min-width
  //   //  - show right-only splitter
  //   //- if both cards = min-width
  //   //  - show no-resize splitter
  //
  //   //given a card in this row, it's positional information and a mouseEvent...
  //   //decide how to show what sort of splitter
  //   let cardCount = this.get('model.cards.length');
  //   //if there is just one card in the row, we just return, we we can't resize it
  //   if(cardCount === 1){
  //     this.set('resizerModel', resizerModel);
  //     return;
  //   }
  //   console.log('onUpdateCardResizer:showing resizer...');
  //   //get the index of the passed in card so we can determine position and neighbors
  //   let cardIdx = this.get('model.cards').indexOf(options.card);
  //
  //   console.log('onUpdateCardResizer:Edge: ' + options.edge + ' Card Index: ' + cardIdx + ' Card Count: ' + cardCount);
  //
  //   //if this is the first card, and the requested edge is left, return
  //   if(cardIdx === 0 && options.edge === 'left'){
  //     this.set('resizerModel', resizerModel);
  //     return;
  //   }
  //   //if this is the last card, and the requested edge  is right, return
  //   if(cardIdx === (cardCount - 1) && options.edge === 'right'){
  //     this.set('resizerModel', resizerModel);
  //     return;
  //   }
  //
  //   //At this point we know we are going to show *something*...
  //
  //   //get the impactedNeighbor
  //   let neighborIndex = ( options.edge === 'right' ) ? cardIdx + 1 : cardIdx -1;
  //
  //   let impactedNeighbor = this.get('model.cards').objectAt(neighborIndex);
  //
  //   let showLeftSizer = false;
  //   let showRightSizer = false;
  //
  //   if(impactedNeighbor.width > 1){
  //     //we can show the edgeSide
  //     if(options.edge === 'right'){
  //       showRightSizer = true;
  //     }else{
  //       showLeftSizer= true;
  //     }
  //   }
  //   if(options.card.width > 1){
  //     //we can show the nonedgeside
  //     if(options.edge === 'right'){
  //       showLeftSizer = true;
  //     }else{
  //       showRightSizer= true;
  //     }
  //   }
  //
  //   //ok - we need to show something... which means we need positional information
  //   let leftPos = options.cardPosition.left;
  //   if(options.edge === 'right'){
  //     leftPos = options.cardPosition.right;
  //   }
  //
  //   resizerModel = {
  //     position : {
  //       "top":options.cardPosition.top + 10,
  //       "bottom":options.cardPosition.bottom - 10,
  //       "left":leftPos - 9,
  //       "height":options.cardPosition.height - 20,
  //     },
  //     visible:true,
  //     showRightSizer: showRightSizer,
  //     showLeftSizer: showLeftSizer,
  //     cardIndex: cardIdx,
  //     edge: options.edge
  //   };
  //   this.set('resizerModel', resizerModel);
  // },

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
    },
    onUpdateCardResizer(options){
      this._updateCardResizer(options);
    },

    /**
     * shift a shared edge
     */
    // onShiftSharedEdge(cardIndex, edge, direction){
    //   //console.log('BSROWEDITOR onShift ' + cardIndex + ' ' + edge);
    //   let rightCard;
    //   let  leftCard;
    //   if(edge==="right"){
    //     leftCard = this.get('model.cards').objectAt(cardIndex);
    //     rightCard = this.get('model.cards').objectAt(cardIndex + 1);
    //   }else{
    //     rightCard = this.get('model.cards').objectAt(cardIndex);
    //     leftCard = this.get('model.cards').objectAt(cardIndex -1);
    //   }
    //   if(direction ==='right'){
    //     Ember.set(rightCard, 'width', rightCard.width - 1);
    //     Ember.set(leftCard, 'width', leftCard.width + 1);
    //   }else{
    //     Ember.set(leftCard, 'width', leftCard.width - 1);
    //     Ember.set(rightCard, 'width', rightCard.width + 1);
    //   }
    //
    // }
  }

});
