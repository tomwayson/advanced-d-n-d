import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['row', 'bs-row-editor'],
  eventBus: Ember.inject.service(),
  resizerModel: {},
  // didInsertElement: function(){
  //   //setup drag handlers for the splitter
  //   //we do this as raw dom b/c it side-steps
  //   //the ember render loop which is needed to
  //   //get the perf we need
  //
  //   this.$('.splitter').on('mousedown', this.splitterMouseDown);
  //   this.$('.splitter').on('mouseup', this.splitterMouseUp);
  //   this.$('.splitter').on('mousemove', this.splitterMouseMove);
  //
  // },
  // willDestroyElement() {
  //   this._super(...arguments);
  //   //remove handlers...
  //   this.$('.splitter').off('mousedown');
  //   this.$('.splitter').off('mouseup');
  //   this.$('.splitter').off('mousemove');
  // },
  // splitterState: {
  //   visible: false,
  //   isDragging: false,
  //   canResize: false
  // },
  // splitterMouseDown(event){
  //   console.log('Splitter Mouse Down');
  //   //this.splitterState.isDragging = true;
  // },
  // splitterMouseUp(event){
  //   console.log('Splitter Mouse Up');
  //   //this.splitterState.isDragging = false;
  // },
  // splitterMouseMove(event){
  //   if(this.splitterState.isDragging){
  //     console.log('Dragging Splitter...');
  //   }else{
  //     console.log('Splitter mousemove');
  //   }
  // },

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


    //preventDefault for valid objects of correct type
    if(td.objectType === 'card'){
      //console.info('DRAGENTER ON ROW ' + this.get('elementId') + ' for ' + td.objectType);
      event.preventDefault();
    }
    //getComponentElement
    let $el = Ember.$(event.target);
    let componentElement = $el[0];
    //We are entering something that's a child of our element
    if($el.parents('#'+this.get('elementId')).length){
      //if this element is not the root of the component...
      if($el.attr('id')!== this.get('elementId')){
        //skip the next leave event b/c it's NOT actually exiting the component...
        this.set('ignoreNextLeave', true);
        //get the root component div so we can get card sizes...
        componentElement = $el.parents('#'+this.get('elementId'))[0];
      }
    }
    let componentPosition = componentElement.getBoundingClientRect();

    let cp = {
      top: componentPosition.top + window.scrollY,
      left: componentPosition.left + window.scrollX,
      bottom: componentPosition.bottom + window.scrollY,
      rigth: componentPosition.right + window.scrollX,
      width: componentPosition.width,
      height: componentPosition.height
    };


    this.set('componentPosition',cp);

  },

  dragOver(event){
    let td = this.get('eventBus.transferData');
    if(td.objectType !== 'card'){
      console.log('DRAGOVER ON ROW for ' + td.objectType + ' rejected.' );
      return;
    }
    event.preventDefault();
    //get the x,y from the event
    let mousePos = {
      x: event.originalEvent.clientX + window.scrollX,
      y: event.originalEvent.clientY + window.scrollY
    };
    let crackcss = {
      display:"none"
    };
    //get the card rectangle
    let componentPosition = this.get('componentPosition');
    let proximity = componentPosition.height / 4;
    let insertAfter = false;
    let transferAction = td.action;

    if(mousePos.y > componentPosition.top && mousePos.y < (componentPosition.top + proximity) ){

      crackcss = {
        "display":"block",
        "background-color":"grey",
        "top":componentPosition.top - 10,
        "left":componentPosition.left + 10,
        "height":"8px",
        "width":componentPosition.width - 20
      };
      insertAfter = false;
      console.log('BS-ROW-EDITOR: Add row ABOVE with card' );
      transferAction= 'add-row';
    }

    //Close to the bottom
    if(mousePos.y > (componentPosition.bottom - proximity) && mousePos.y < (componentPosition.bottom) ){

      crackcss = {
        "display":"block",
        "background-color":"grey",
        "top":componentPosition.bottom + 10,
        "left":componentPosition.left + 10,
        "height":"8px",
        "width":componentPosition.width - 20
      };
      insertAfter = true;
      console.log('BS-ROW-EDITOR: Add row BELOW with card' );
      transferAction= 'add-row';
    }

    this.set('eventBus.transferData.action', transferAction);
    //set the crack css
    this.$('.row-crack').css(crackcss);

    this.set('eventBus.transferData.dropRowInfo', {
      row: this.get('model'),
      insertAfter:insertAfter
    });


  },

  drop(event){
    //set the crack css
    this.$('.row-crack').css({"display":"none"});
    let eventBus = this.get('eventBus');
    let td = this.get('eventBus.transferData');
    // row handler only supports adding/moving cards
    if(td.action !== 'add-card' && td.action !== 'move-card'){
      console.log('BS-ROW-EDITOR: skipping DROP for ' + this.get('elementId') + ' caught drop for type ' + td.objectType + ' Action: ' + td.action);
      return;
    }
    console.log('BS-ROW-EDITOR: Processing DROP for ' + this.get('elementId') + ' caught drop for type ' + td.objectType + ' Action: ' + td.action);
    let newCard = td.model;
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
          // TODO: return?
        }else{
          //ok we can split
          // if we're moving a card, need to first
          // remove it from it's original row
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
        // TODO: clear event bus drag state?
        // here, or below where the drop state is cleared?
      }
    }else{
      console.error('Card can not be dropped at this location.');
    }

    // else{
    //   //we are inserting into a new row...
    //   // TODO: what size should it be?
    //     newCard = {
    //       "width":4,
    //       "height": 4,
    //       "component": {"name": "placeholder-card"}
    //     };
    //     // insert the card
    //     this._insertCard(newCard, targetCard, insertAfter);
    // }

    // clear event bus drop state
    eventBus.set('dropCardInfo', null);
  },


  mouseLeave(event){
    //when the mouse leaves this component, we should hide all resizers and crack
    this.set('showResizer', false);
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

      // let cards= this.get('model.cards');
      //
      // //Scenarios:
      // //  Row has one card, and we are deleting it
      // //    - delete the row
      // if(cards.length === 1){
      //   this.sendAction('onRowDelete', this.get('model'));
      // }else{
      //
      // //  Row has > 1 card to the right of card we are deleting
      // //    - expand card to the right to fill void
      // //
      // //  Row has > 1 card to the left of card we are deleting
      // //    - expand card to the left to fill void
      // //
      //
      //   //get the index of the card we are about to delete
      //   let deletedCardIndex = cards.indexOf( cardToDelete );
      //   //assume we will expand the first card (left)...
      //   let expandCardIndex = 1;
      //   if(deletedCardIndex > 0){
      //     //we expand the card at index 1
      //     expandCardIndex = deletedCardIndex - 1;
      //   }
      //   //get the card to expan
      //   let expandCard = cards.objectAt(expandCardIndex);
      //   //expanded width
      //   let expandedWidth = cardToDelete.width + expandCard.width;
      //   Ember.set(expandCard, 'width', expandedWidth);
      //
      //
      //   //remove the card
      //   this.set('model.cards', this.get('model.cards').without( cardToDelete ));

      }

    },
    onShowCardResize(card, edge, cardPosition){
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
        console.info('Rejecting Resize for Only Card');
        this.set('showResizer', false);
        return;
      }

      //get the index of the passed in card so we can determine position and neighbors
      let cardIdx = this.get('model.cards').indexOf(card);

      console.log('Edge: ' + edge + ' Card Index: ' + cardIdx + ' Card Count: ' + cardCount);

      //if this is the first card, and the requested edge is left, return
      if(cardIdx === 0 && edge === 'left'){
        console.info('Rejecting Left Resize for First Card');
        return;
      }
      //if this is the last card, and the requested edge  is right, return
      if(cardIdx === (cardCount - 1) && edge === 'right'){
        console.info('Rejecting Right Resize for Last Card');
        return;
      }

      //get the impactedNeighbor
      let neighborIndex = ( edge === 'right' ) ? cardIdx + 1 : cardIdx -1;

      let impactedNeighbor = this.get('model.cards').objectAt(neighborIndex);

      let showLeftSizer = false;
      let showRightSizer = false;

      if(impactedNeighbor.width > 1){
        //we can show the edgeSide
        if(edge === 'right'){
          showRightSizer = true;
        }else{
          showLeftSizer= true;
        }
      }
      if(card.width > 1){
        //we can show the nonedgeside
        if(edge === 'right'){
          showLeftSizer = true;
        }else{
          showRightSizer= true;
        }
      }


      //ok - we need to show something... which means we need positional information
      let leftPos = cardPosition.left;
      if(edge === 'right'){
        leftPos = cardPosition.right;
      }

      let resizerModel = {
        position : {
          "top":cardPosition.top + 10,
          "bottom":cardPosition.bottom - 10,
          "left":leftPos - 9,
          "height":cardPosition.height - 20,
        },
        showRightSizer: showRightSizer,
        showLeftSizer: showLeftSizer,
        cardIndex: cardIdx,
        edge: edge
      };
      this.set('resizerModel', resizerModel);
      this.set('showResizer', true);

    },

    onShift(cardIndex, edge, direction){
      console.log('BSROWEDITOR onShift ' + cardIndex + ' ' + edge);
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
      this.set('showResizer', false);
    }
  }

});
