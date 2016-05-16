/**
 * layout-section-editor/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'section',
  classNames:['layout-section-editor'],
  classNameBindings:['highlight'],
  highlight:false,
  dragType:'section',
  dragAction:'move',  //always a move
  hasRows: Ember.computed('model.rows.length', function(){
    return this.get('model.rows.length');
  }),
  init(){
    this._super(...arguments);
    this.get('layoutCoordinator').sectionComponents.push(this);
  },
  willDestroyElement(){
    //remove the component from the hash
    this.set('layoutCoordinator.sectionComponents', this.get('layoutCoordinator.sectionComponents').without(this));
  },
  /**
   * Component Position
   * ,top,bottom,right,left,height,width of this component
   * Marked Volatile so it's recomputed when requested
   */
  componentPosition: Ember.computed('model', function(){
    return this.getComponentPosition();
  }).volatile(),


  mouseEnter(/*event*/){
    if(!this.get('layoutCoordinator.draggingProperties')){
      this.get('layoutCoordinator').trigger( 'showSectionControls' , this );
    }
  },

  mouseLeave(event){
    //check if the mouse is still within the card...
    //get the x,y from the event
    let mousePos = {
      x: event.originalEvent.clientX + window.pageXOffset,
      y: event.originalEvent.clientY + window.pageYOffset
    };
    let cp = this.get('componentPosition');

    if(mousePos.x >= cp.left && mousePos.x <= cp.right &&
       mousePos.y >= cp.top  && mousePos.y <= cp.bottom){
      //still inside
    }else{
      if(!this.get('layoutCoordinator.draggingProperties')){
        this.get('layoutCoordinator').trigger( 'showSectionControls'  );
      }
    }
  },


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

  insertCardIntoNewRow(card, targetRowModel, dockingTarget){
    //first card in a new row is always 12 wide
    Ember.set(card, 'width', 12);

    const rows = this.get('model.rows');
    // where to insert?
    // default to the begining (left)
    let pos = 0;
    if (targetRowModel) {
      // if inserting before, use target card's current index
      // otherwise (inserting after) use the next index
      pos = rows.indexOf(targetRowModel);
      if(dockingTarget === 'row-bottom'){
        pos++;
      }
    }
    //we need to cook a row model
    let row = {
      cards:[card]
    };
    rows.insertAt(pos, row);
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
