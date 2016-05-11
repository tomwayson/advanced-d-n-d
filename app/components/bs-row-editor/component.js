import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['row', 'bs-row-editor'],
  eventBus: Ember.inject.service(),
  resizerModel: {},
  //queue of cards to add... allows us to defer some
  //changes until after css transitions have happened...
  cardQueue: [],
  onNoCards: Ember.observer('model.cards.length', function(){
    if(this.get('model.cards.length') === 0){
      console.log('cards is empty, sending onRowDelete');
      this.sendAction('onRowDelete', this.get('model'));
    }
  }),

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

  ignoreNextLeave:false,

  dragEnter(event){
    let td = this.get('eventBus.transferData');
    // only if dragged object is a card
    if(!td || td.objectType !== 'card') {
      return;
    }
    event.preventDefault();
  },

  dragOver(event){
    let td = this.get('eventBus.transferData');

    // only if dragged object is a card
    if(!td || td.objectType !== 'card'){
      return;
    }
    event.preventDefault();
    //get the x,y from the event
    let mousePos = {
      x: event.originalEvent.clientX + window.scrollX,
      y: event.originalEvent.clientY + window.scrollY
    };

    //get the card rectangle
    let componentPosition = this.get('componentPosition');
    let proximity = componentPosition.height / 4;
    let insertAfter = false;
    let transferAction = td.action;
    let dropTargetModel = null;

    if(mousePos.y > componentPosition.top && mousePos.y < (componentPosition.top + proximity) ){

      dropTargetModel = {
        "top":componentPosition.top - 10,
        "left":componentPosition.left + 10,
        "height":4,
        "width":componentPosition.width - 20
      };
      insertAfter = false;
      console.log('BS-ROW-EDITOR: Add row ABOVE with card' );
      transferAction= 'add-row';
    }

    //Close to the bottom
    if(mousePos.y > (componentPosition.bottom - proximity) && mousePos.y < (componentPosition.bottom) ){

      dropTargetModel = {
        "top":componentPosition.bottom + 6,
        "left":componentPosition.left + 10,
        "height":4,
        "width":componentPosition.width - 20
      };
      insertAfter = true;
      console.log('BS-ROW-EDITOR: Add row BELOW with card' );
      transferAction= 'add-row';
    }

    if(dropTargetModel){
      this.get('eventBus').trigger('showDropTarget', dropTargetModel);
    }
    this.set('eventBus.transferData.action', transferAction);
    this.set('eventBus.transferData.dropRowInfo', {
      row: this.get('model'),
      insertAfter:insertAfter
    });


  },

  drop(event){
    //set the crack css
    //this.$('.row-crack').css({"display":"none"});
    this.get('eventBus').trigger('hideDropTarget');

    let eventBus = this.get('eventBus');
    //get the transferData from the eventBus
    let td = this.get('eventBus.transferData');
    // row handler only supports adding/moving cards
    if(!td || (td.action !== 'add-card' && td.action !== 'move-card')) {
      return;
    }
    console.log('BS-ROW-EDITOR: Processing DROP for ' + this.get('elementId') + ' caught drop for type ' + td.objectType + ' Action: ' + td.action);

    //default to the card...
    let newCard = td.model;
    if(td.action ==='add-card'){
      //but if we are adding it we want a clone
      newCard = Object.assign({},td.model);
    }


    let targetCard, insertAfter;
    let dropCardInfo = eventBus.get('dropCardInfo');
    if (dropCardInfo) {
      // our drop target is a card
      targetCard = dropCardInfo.card;
      insertAfter = dropCardInfo.insertAfter;
      //targetCard needs to be >1 wide...
      if(targetCard.width > 1 ){
        if(targetCard.minWidth && targetCard.width === targetCard.minWidth){
          //we can't split this either
          console.error('Card can not be dropped at this location.');
        }else{
          //ok we can split
          // if we're moving a card, remove it from it's original row
          if (td.dragType === 'move') {
            this.sendAction('onCardDelete', newCard, td.draggedFromRow);
          }
          // make room for the dropped card by
          // splitting the target card width
          let halfWidth = (targetCard.width / 2);
          Ember.set(targetCard,'width',Math.ceil(halfWidth));
          // set the card width/height based on above calculations
          Ember.set(newCard, 'width', Math.floor(halfWidth));
          // insert the card
          this._insertCard(newCard, targetCard, insertAfter);
        }
      }
      // clear event bus drop info
      this.set('eventBus.dropCardInfo', null);
    }else{
      console.error('Card can not be dropped at this location.');
    }

    // clear event bus drag info
    this.set('eventBus.transferData', null);
  },

  dragLeave(){
    this.get('eventBus').trigger('hideDropTarget');
  },
  mouseLeave(/*event*/){
    //when the mouse leaves this component, we should hide all resizers and crack
    this._updateCardResizer({visible:false});
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
      top: card.top + window.scrollY,
      left: card.left + window.scrollX,
      bottom: card.bottom + window.scrollY,
      right: card.right + window.scrollX,
      width: card.width,
      height: card.height
    };
    return cp;
  },

  _updateCardResizer(options){
    //setup a default model that will hide the resizer
    //this allows us to return early out of this function
    //which allows us to do less work if short-circuting
    let resizerModel = {
      visible:false,
      position : null,
      showRightSizer: false,
      showLeftSizer: false,
      edge: options.edge
    };

    if(!options.visible){
      //console.log('onUpdateCardResizer:hiding resizer...');
      this.set('resizerModel', resizerModel);
      return;
    }

    //Scenarios
    //- if both cards.width > min-width
    //  - show bi-directional
    //- if right-card = min-width
    //  - show left-only splitter
    //- if left-card = min-width
    //  - show right-only splitter
    //- if both cards = min-width
    //  - show no-resize splitter

    //given a card in this row, it's positional information and a mouseEvent...
    //decide how to show what sort of splitter
    let cardCount = this.get('model.cards.length');
    //if there is just one card in the row, we just return, we we can't resize it
    if(cardCount === 1){
      this.set('resizerModel', resizerModel);
      return;
    }

    //get the index of the passed in card so we can determine position and neighbors
    let cardIdx = this.get('model.cards').indexOf(options.card);

    //console.log('Edge: ' + edge + ' Card Index: ' + cardIdx + ' Card Count: ' + cardCount);

    //if this is the first card, and the requested edge is left, return
    if(cardIdx === 0 && options.edge === 'left'){
      this.set('resizerModel', resizerModel);
      return;
    }
    //if this is the last card, and the requested edge  is right, return
    if(cardIdx === (cardCount - 1) && options.edge === 'right'){
      this.set('resizerModel', resizerModel);
      return;
    }

    //At this point we know we are going to show *something*...

    //get the impactedNeighbor
    let neighborIndex = ( options.edge === 'right' ) ? cardIdx + 1 : cardIdx -1;

    let impactedNeighbor = this.get('model.cards').objectAt(neighborIndex);

    let showLeftSizer = false;
    let showRightSizer = false;

    if(impactedNeighbor.width > 1){
      //we can show the edgeSide
      if(options.edge === 'right'){
        showRightSizer = true;
      }else{
        showLeftSizer= true;
      }
    }
    if(options.card.width > 1){
      //we can show the nonedgeside
      if(options.edge === 'right'){
        showLeftSizer = true;
      }else{
        showRightSizer= true;
      }
    }


    //ok - we need to show something... which means we need positional information
    let leftPos = options.cardPosition.left;
    if(options.edge === 'right'){
      leftPos = options.cardPosition.right;
    }

    resizerModel = {
      position : {
        "top":options.cardPosition.top + 10,
        "bottom":options.cardPosition.bottom - 10,
        "left":leftPos - 9,
        "height":options.cardPosition.height - 20,
      },
      visible:true,
      showRightSizer: showRightSizer,
      showLeftSizer: showLeftSizer,
      cardIndex: cardIdx,
      edge: options.edge
    };
    this.set('resizerModel', resizerModel);
  },

  /**
   * Handle actions, bubbling from the cards in the row
   */
  actions: {
    onCardDrag() {
      // if card is dragged to another row
      // make sure it is removed from this row
      this.set('eventBus.transferData.draggedFromRow', this.get('model'));
    },
    onCardDelete( cardToDelete ) {
      this.sendAction('onCardDelete', cardToDelete, this.get('model'));
    },
    onUpdateCardResizer(options){
      this._updateCardResizer(options);

    },

    /**
     * shift a shared edge
     */
    onShiftSharedEdge(cardIndex, edge, direction){
      //console.log('BSROWEDITOR onShift ' + cardIndex + ' ' + edge);
      let rightCard;
      let  leftCard;
      if(edge==="right"){
        leftCard = this.get('model.cards').objectAt(cardIndex);
        rightCard = this.get('model.cards').objectAt(cardIndex + 1);
      }else{
        rightCard = this.get('model.cards').objectAt(cardIndex);
        leftCard = this.get('model.cards').objectAt(cardIndex -1);
      }
      if(direction ==='right'){
        Ember.set(rightCard, 'width', rightCard.width - 1);
        Ember.set(leftCard, 'width', leftCard.width + 1);
      }else{
        Ember.set(leftCard, 'width', leftCard.width - 1);
        Ember.set(rightCard, 'width', rightCard.width + 1);
      }

    }
  }

});
