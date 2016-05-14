import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'section',
  classNames:['layout-section-editor'],
  dragType:'section',
  hasRows: Ember.computed('model.rows.length', function(){
    return this.get('model.rows.length');
  }),
  init(){
    this._super(...arguments);
    this.get('layoutCoordinator').sections.push(this);
  },
  willDestroyElement(){
    //remove the component from the hash
    this.set('layoutCoordinator.sections', this.get('layoutCoordinator.sections').without(this));
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
    let rect = componentElement.getBoundingClientRect();
    //create a json object that accounts for scroll position
    let cp = {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset,
      bottom: rect.bottom + window.pageYOffset,
      right: rect.right + window.pageXOffset,
      width: rect.width,
      height: rect.height
    };
    return cp;
  },

  /**
   * Centralized Handling of Card Removal
   */
  removeCard(cardToRemove, row) {
    let cards= row.cards;
    //Scenarios:
    //  Row has one card, and we are deleting it
    //    - delete the row
    if(cards.length === 1){
      console.log('LAYOUT-SECTION-EDITOR:removeCard - removing last card in row...');
      Ember.set(row, 'cards',[]);
      this.removeRow(row);
    }else{

    //  Row has > 1 card to the right of card we are deleting
    //    - expand card to the right to fill void
    //
    //  Row has > 1 card to the left of card we are deleting
    //    - expand card to the left to fill void
    //

      //get the index of the card we are about to delete
      let removeCardIndex = cards.indexOf( cardToRemove );
      if (removeCardIndex === -1) {
        // card not found, bail out
        return;
      }
      //assume we will expand the first card (left)...
      let expandCardIndex = 1;
      if(removeCardIndex > 0){
        //we expand the card at index 1
        expandCardIndex = removeCardIndex - 1;
      }
      //get the card to expan
      let expandCard = cards.objectAt(expandCardIndex);
      //expanded width
      let expandedWidth = cardToRemove.width + expandCard.width;
      Ember.set(expandCard, 'width', expandedWidth);
      //remove the card
      Ember.set(row, 'cards', cards.without( cardToRemove ));
    }
  },

  /**
   * Centralized Handling of Row Removal
   */
  removeRow(row){
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
  layoutCoordinator: Ember.inject.service('layout-coordinator'),

  // dragEnter(event){
  //   let td = this.get('layoutCoordinator.transferData');
  //
  //   // only if dragged object is a section or adding a row
  //   if(!td || (td.objectType !=='section' && td.action !== 'add-row')) {
  //     return;
  //   }
  //
  //   // we'll handle this
  //   event.preventDefault();
  // },
  // dragLeave(){
  //   this.get('layoutCoordinator').trigger('hideDropTarget');
  // },
  // dragOver(event){
  //   let td = this.get('layoutCoordinator.transferData');
  //
  //   // only if dragged object is a section or adding a row
  //   if(!td) {
  //     return;
  //   }
  //
  //   if (td.objectType === 'section') {
  //     // we'll handle this
  //     event.preventDefault();
  //
  //     // user is dragging sections
  //     //get the x,y from the event
  //     let mousePos = {
  //       x: event.originalEvent.clientX + window.pageXOffset,
  //       y: event.originalEvent.clientY + window.pageYOffset
  //     };
  //
  //     //get the card rectangle
  //     let componentPosition = this.get('componentPosition');
  //     let proximity = componentPosition.height / 4;
  //     let insertAfter = false;
  //     let transferAction = td.action;
  //     let dropTargetModel = null;
  //
  //     //Close to the top
  //     if(mousePos.y > componentPosition.top && mousePos.y < (componentPosition.top + proximity) ){
  //
  //       dropTargetModel = {
  //         "top":componentPosition.top - 10,
  //         "left":componentPosition.left + 10,
  //         "height":4,
  //         "width":componentPosition.width - 20
  //       };
  //       insertAfter = false;
  //       console.log('PAGE-LAYOUT-EDITOR: Add section ABOVE with card' );
  //       transferAction = td.dragType + '-section';
  //     }
  //
  //     //Close to the bottom
  //     if(mousePos.y > (componentPosition.bottom - proximity) && mousePos.y < (componentPosition.bottom) ){
  //
  //       dropTargetModel = {
  //         "top":componentPosition.bottom + 6,
  //         "left":componentPosition.left + 10,
  //         "height":4,
  //         "width":componentPosition.width - 20
  //       };
  //       insertAfter = true;
  //       console.log('PAGE-LAYOUT-EDITOR: Add section BELOW with card' );
  //       transferAction = td.dragType + '-section';
  //     }
  //
  //     if(dropTargetModel){
  //       this.get('layoutCoordinator').trigger('showDropTarget', dropTargetModel);
  //     }
  //     this.set('layoutCoordinator.transferData.action', transferAction);
  //     this.set('layoutCoordinator.transferData.dropSectionInfo', {
  //       section: this.get('model'),
  //       insertAfter:insertAfter
  //     });
  //
  //   } else {
  //     if (!this.get('hasRows')) {
  //       // dragging over section w/o rows, we'll handle this
  //       event.preventDefault();
  //       // want to add row if dropped here
  //       this.set('layoutCoordinator.transferData.action', 'add-row');
  //     }
  //   }
  // },
  // drop(event){
  //   let td = this.get('layoutCoordinator.transferData');
  //   if(!td){
  //     return;
  //   }
  //   console.info('DROP ON SECTION for ' + td.objectType + ' and  Action: ' + td.action);
  //
  //   //can accept an add-row action
  //   if(td.action === 'add-row'){
  //     event.preventDefault();
  //     // create a row object with a single, full width card
  //     let newCard = td.model;
  //     // if we're moving a card, need to first
  //     // remove it from it's original row
  //     if (td.dragType === 'move') {
  //       this.removeCard(newCard, td.draggedFromRow);
  //       // TODO: clear event bus reference to draggedFromRow?
  //     }
  //     Ember.set(newCard, 'width', 12);
  //     let row = {
  //       cards:[newCard]
  //     };
  //     //figure out the position to inject it...
  //     let pos = 0;
  //     if(td.dropRowInfo && td.dropRowInfo.row){
  //       pos = this.get('model.rows').indexOf(td.dropRowInfo.row) + (td.dropRowInfo.insertAfter ? 1:0);
  //     }
  //     this.get('model.rows').insertAt(pos, row);
  //     this.set('layoutCoordinator.transferData', null);
  //   }
  // },

  actions: {
    onRowRemove( row ){
      this.removeRow(row);
    },
    onCardRemove(card, row) {
      this.removeCard(card, row);
    },
    removeSection() {
      console.log('Section:Remove Event Fired')
      this.sendAction('onRemoveSection', this.get('model'));
    },
    editSection() {
      console.log('Section:Edit Event Fired')
      this.sendAction('onEditSection', this.get('model'));
    }
  }
});
