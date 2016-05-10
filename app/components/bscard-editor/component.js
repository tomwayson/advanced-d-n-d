import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['card-editor'],
  classNameBindings:['bootstrapGridClass'],

  attributeBindings:['draggable'],
  //make this component draggable
  draggable:false,


  bootstrapGridClass:Ember.computed('model.width', function(){
    return 'col-md-' + this.get('model.width');
  }),

  minWidth: Ember.computed('model', function(){
    let modelMinWidth = this.get('model.minWidth');
    return modelMinWidth ? modelMinWidth : 1;
  }),

  /**
   * Get the event bus
   */
  eventBus: Ember.inject.service('event-bus'),

  ignoreNextLeave:false,

  // didInsertElement() {
  //   this._super(...arguments);
  //
  // },

  dragStart(event){
    //-----------------
    //NOTE: Setting props in didInsertElement throws warnings...
    //-----------------
    // b/c we're dragging from upper right corner,
    // want to shift to the left by width of the element
    // TODO: probably want to set drag image offset x/y dynamically
    // to account for mouse position over handle
    // const $el = this.$();
    // this.set('dragImage', $el[0]);
    // this.set('dragImageOffsetX', $el.outerWidth());
    const $el = this.$();
    event.dataTransfer.setDragImage($el[0], $el.outerWidth(), 0);

    // this.set('dragImage', $el[0]);
    // this.set('dragImageOffsetX', $el.outerWidth());
    this.sendAction('onCardDrag');
  },


  dragEnter(event){
    event.preventDefault();
  },

  /**
   * When something is dropped on a card,
   * hide the crack drop-indicator
   */
  drop(event){
    Ember.$('.crack').css({display:"none"});
    this.get('eventBus').trigger('hideDropTarget');
  },

  /**
   * As something is dragged over the card
   * - show the cracks
   */
  dragOver(event){
    let td = this.get('eventBus.transferData');

    //get the x,y from the event
    let mousePos = {
      x: event.originalEvent.clientX + window.scrollX,
      y: event.originalEvent.clientY + window.scrollY
    };

    //get the card rectangle
    let card = this.get('componentPosition');

    //when you are within 1/4 of the dimension
    let xProximity = 30;
    let yProximity = 30;
    let inset = 10;

    // insert before or after this card? default to after
    let insertAfter = false;
    let dropTargetModel = null;
    /**
     * Determine if we are close to an edge...
     */
    //check if this card is already at it's min-width
    if(this.get('model.width') > this.get('minWidth')){
      //Close to the left
      if(mousePos.x > card.left && mousePos.x < (card.left + xProximity) ){

        dropTargetModel = {
          "top":card.top + inset,
          "left":card.left + inset,
          "height":card.height - (2 * inset),
          "width":"4"
        };
        insertAfter = false;
      }

      //Close to the right
      if(mousePos.x > ( card.right - xProximity)  && mousePos.x < card.right )  {

        dropTargetModel = {
          "top":card.top + inset,
          "left":card.right - inset,
          "height":card.height - (2 * inset),
          "width":4
        };
        insertAfter = true;
      }
    }
    //Close to the top
    //console.log( 'card.top:' + card.top + ' y: ' + mousePos.y +' prx: ' + (card.top + proximity));
    // if(mousePos.y > card.top && mousePos.y < (card.top + yProximity) ){
    //
    //   crackcss = {
    //     "display":"block",
    //     "background-color":"purple",
    //     "top":card.top + inset,
    //     "left":card.left + inset,
    //     "height":"4px",
    //     "width":card.width - (2 * inset)
    //   };
    //   insertAfter = false;
    // }
    //
    // //Close to the bottom
    // if(mousePos.y > (card.bottom - yProximity) && mousePos.y < (card.bottom) ){
    //
    //   crackcss = {
    //     "display":"block",
    //     "background-color":"navy",
    //     "top":card.bottom + inset,
    //     "left":card.left + inset,
    //     "height":"4px",
    //     "width":card.width - (2 * inset)
    //   };
    //   insertAfter = true;
    // }

    if(dropTargetModel){
      this.get('eventBus').trigger('showDropTarget', dropTargetModel);
    }
    // set target card and before/after
    // TODO: change to .transferData.
    this.set('eventBus.dropCardInfo', {
      card: this.get('model'),
      insertAfter:insertAfter
    });
    this.set('eventBus.transferData.action', td.dragType + '-card');
  },

  /**
   * When something leaves the component...
   * - hide the crack
   */
  dragLeave(event){
    if(!this.get('ignoreNextLeave')) {
      //Ember.$('.crack').css({display:"none"});
      this.get('eventBus').trigger('hideDropTarget');
    }else{
      this.set('ignoreNextLeave', false);
    }
  },


  mouseMove(event){
    //if we are close to an edge, show the resizer
    let mousePos = {
      x: event.clientX + window.scrollX,
      y: event.clientY + window.scrollY
    };
    let componentPosition = this.get('componentPosition');
    let resizerProximity = 10;
    let canResize = false;
    //check if we are close to a resizable edge
    if(mousePos.x > componentPosition.left && mousePos.x < (componentPosition.left + resizerProximity)){
      //send event info up to the bs-row-editor which actually handles showing the resizer
      this.sendAction('onShowCardResize', this.get('model'), 'left', componentPosition);
      //
      canResize = true;
    }

    if(mousePos.x < componentPosition.right && mousePos.x > (componentPosition.right - resizerProximity)){
      //send event info up
      this.sendAction('onShowCardResize', this.get('model'), 'right', componentPosition);
      canResize = true;
    }

    this.set('canResize', canResize);

  },

  /**
   * Component Position
   * ,top,bottom,right,left,height,width of this component
   * Marked Volatile so it's recomputed when requested
   */
  componentPosition: Ember.computed('model.width', function(){
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


  actions: {
    onModelChanged() {

    },

    deleteCard(){
      Ember.debug('bscard-editor:deleteCard...');
      this.sendAction('onCardDelete', this.get('model'));
      //this.destroy();
    },

  }
});
