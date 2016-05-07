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
    // TODO: are we adding a card or moving a card?
    // for now only adding
    // where to place the card?
    let eventBus = this.get('eventBus');
    let td = this.get('eventBus.transferData');
    if(td.action !== 'add-card'){
      console.log('BS-ROW-EDITOR: skipping DROP for ' + this.get('elementId') + ' caught drop for type ' + td.objectType + ' Action: ' + td.action);
      return;
    }
    console.log('BS-ROW-EDITOR: Processing DROP for ' + this.get('elementId') + ' caught drop for type ' + td.objectType + ' Action: ' + td.action);
    let targetCard, insertAfter, newCard;
    let dropCardInfo = eventBus.get('dropCardInfo');
    //if we have a card...
    if (dropCardInfo) {
      targetCard = dropCardInfo.card;
      insertAfter = dropCardInfo.insertAfter;
      //targetCard needs to be >1 wide...
      if(targetCard.width > 1 ){
        if(targetCard.minWidth && targetCard.width === targetCard.minWidth){
          //we can't split this either
        }else{
          //ok we can split
          let halfWidth = targetCard.width / 2;
          Ember.set(targetCard,'width',halfWidth);
          newCard = {
            "width":halfWidth,
            "height": 4,
            "component": {"name": "placeholder-card"}
          };
          // insert the card
          this._insertCard(newCard, targetCard, insertAfter);
        }
      }

    }else{
      //we are inserting into a new row...
      // TODO: what size should it be?
        newCard = {
          "width":4,
          "height": 4,
          "component": {"name": "placeholder-card"}
        };
        // insert the card
        this._insertCard(newCard, targetCard, insertAfter);
    }

    // clear event bus state
    eventBus.set('dropCardInfo', null);
  },



  /**
   * Handle actions, bubbling from the cards in the row
   */
  actions: {
    onCardDelete( cardToDelete ) {
      let cards= this.get('model.cards');

      //Scenarios:
      //  Row has one card, and we are deleting it
      //    - delete the row
      if(cards.length === 1){
        this.sendAction('onRowDelete', this.get('model'));
      }else{

      //  Row has > 1 card to the right of card we are deleting
      //    - expand card to the right to fill void
      //
      //  Row has > 1 card to the left of card we are deleting
      //    - expand card to the left to fill void
      //

        //get the index of the card we are about to delete
        let deletedCardIndex = cards.indexOf( cardToDelete );
        //assume we will expand the first card (left)...
        let expandCardIndex = 1;
        if(deletedCardIndex > 0){
          //we expand the card at index 1
          expandCardIndex = deletedCardIndex - 1;
        }
        //get the card to expan
        let expandCard = cards.objectAt(expandCardIndex);
        //expanded width
        let expandedWidth = cardToDelete.width + expandCard.width;
        Ember.set(expandCard, 'width', expandedWidth);


        //remove the card
        this.set('model.cards', this.get('model.cards').without( cardToDelete ));

      }

    }
  }

});
