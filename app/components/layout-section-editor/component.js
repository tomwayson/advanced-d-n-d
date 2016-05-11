import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'section',
  classNames:['layout-section-editor'],

  hasRows: Ember.computed('model.rows.length', function(){
    return this.get('model.rows.length');
  }),

  /**
   * Centralized Handling of Card Removal
   */
  _removeCard(cardToDelete, row) {
    let cards= row.cards;
    //Scenarios:
    //  Row has one card, and we are deleting it
    //    - delete the row
    if(cards.length === 1){
      console.log('LAYOUT-SECTION-EDITOR:_removeCard - removing last card in row...');
      Ember.set(row, 'cards',[]);
      this._removeRow(row);
    }else{

    //  Row has > 1 card to the right of card we are deleting
    //    - expand card to the right to fill void
    //
    //  Row has > 1 card to the left of card we are deleting
    //    - expand card to the left to fill void
    //

      //get the index of the card we are about to delete
      let deletedCardIndex = cards.indexOf( cardToDelete );
      if (deletedCardIndex === -1) {
        // card not found, bail out
        return;
      }
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
      Ember.set(row, 'cards', cards.without( cardToDelete ));
    }
  },

  /**
   * Centralized Handling of Row Removal
   */
  _removeRow(row){
    //avoid model churn by checking if this actually has the row in it
    let rowIdx = this.get('model.rows').indexOf(row);
    if(rowIdx >= 0){
      this.set('model.rows', this.get('model.rows').without(row));
    }
  },

  /**
   * Choose the container class name basd on the
   * containment property of the section
   */
  containerClass: Ember.computed('model.containment', function(){
    let containment = this.get('model.containment');
    return ( containment === 'fixed') ? 'container' : 'container-fluid';
  }),

  /**
   * The Style will actually be computed from a hash
   * but this is a short-cut to focus on other things
   */
  attributeBindings: ['style'],
  style: Ember.computed('model.style', function(){
    return this.get('model.style');
  }),

  /**
   * Get the event bus
   */
  eventBus: Ember.inject.service('event-bus'),

  dragEnter(event){
    // let td = this.get('eventBus.transferData');
    // console.info('DRAGENTER ON SECTION ' + this.get('elementId') + ' for ' + td.type);
    // if(td.type === 'add-row'){
    //   event.preventDefault();
    // }
    event.preventDefault();
  },
  dragOver(event){
    event.preventDefault();
    // let td = this.get('eventBus.transferData');
    // if(td.type === 'add-row'){
    //   event.preventDefault();
    // }
  },
  drop(event){
    let td = this.get('eventBus.transferData');
    if(!td){
      return;
    }
    //can accept an add-row action
    if(td.action === 'add-row'){
      console.info('DROP ON SECTION for ' + td.objectType + ' and  Action: ' + td.action);
      // create a row object with a single, full width card
      let newCard = td.model;
      // if we're moving a card, need to first
      // remove it from it's original row
      if (td.dragType === 'move') {
        this._removeCard(newCard, td.draggedFromRow);
        // TODO: clear event bus reference to draggedFromRow?
      }
      Ember.set(newCard, 'width', 12);
      let row = {
        cards:[newCard]
      };
      //figure out the position to inject it...
      let pos = 0;
      if(td.dropRowInfo.row){
        pos = this.get('model.rows').indexOf(td.dropRowInfo.row) + (td.dropRowInfo.insertAfter ? 1:0);
      }
      this.get('model.rows').insertAt(pos, row);
      this.set('eventBus.transferData', null);
    }
  },

  actions: {
    onRowDelete( row ){
      this._removeRow(row);
    },
    onCardDelete(card, row) {
      this._removeCard(card, row);
    }
  }

});
