import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['card-editor'],
  classNameBindings:['bootstrapGridClass', 'highlight'],
  highlight:false,
  bootstrapGridClass:Ember.computed('model.width', function(){
    return 'col-md-' + this.get('model.width');
  }),

  minWidth: Ember.computed('model', function(){
    let modelMinWidth = this.get('model.minWidth');
    return modelMinWidth ? modelMinWidth : 1;
  }),

  controlsVisible: false,



  /**
   * Get the event bus
   */
  layoutCoordinator: Ember.inject.service('layout-coordinator'),

  ignoreNextLeave:false,

  init(){
    this._super(...arguments);
    this.get('layoutCoordinator').components.push(this);
  },
  willDestroyElement(){
    //remove the component from the hash
    this.set('layoutCoordinator.components', this.get('layoutCoordinator.components').without(this));

  },

  // dragStart(event){
  //   const $el = this.$();
  //   const $target = this.$(event.target);
  //
  //   // only if started by the drag handle
  //   if (!$target.hasClass('draggable')) {
  //     return;
  //   }
  //   event.dataTransfer.setData('foo/custom','so firefox works');
  //   // b/c we're dragging from upper right corner,
  //   // want to shift to the left by width of the element
  //   // TODO: probably want to set drag image offset x/y dynamically
  //   // to account for mouse position over handle
  //   if (event.dataTransfer && event.dataTransfer.setDragImage) {
  //     event.dataTransfer.setDragImage($el[0], $el.outerWidth(), 0);
  //   }
  //
  //   // let parent row know that a card has started dragging
  //   // incase the card is dragged out of that row
  //   this.sendAction('onCardDrag');
  // },
  //
  //
  // dragEnter(event){
  //   event.preventDefault();
  // },
  //
  // /**
  //  * When something is dropped on a card,
  //  * hide the crack drop-indicator
  //  */
  // drop(event){
  //   Ember.$('.crack').css({display:"none"});
  //   this.get('layoutCoordinator').trigger('hideDropTarget');
  // },
  //
  // /**
  //  * As something is dragged over the card
  //  * - show the cracks
  //  */
  // dragOver(event){
  //   let td = this.get('layoutCoordinator.transferData');
  //
  //   // only if dragged object is a card
  //   if (!td || td.objectType !== 'card') {
  //     return;
  //   }
  //
  //   //get the x,y from the event
  //   let mousePos = {
  //     x: event.originalEvent.clientX + window.scrollX,
  //     y: event.originalEvent.clientY + window.scrollY
  //   };
  //
  //   //get the card rectangle
  //   let card = this.get('componentPosition');
  //
  //   //when you are within 1/4 of the dimension
  //   let xProximity = 30;
  //   let yProximity = 30;
  //   let inset = 10;
  //
  //   // insert before or after this card? default to after
  //   let insertAfter = false;
  //   let dropTargetModel = null;
  //   /**
  //    * Determine if we are close to an edge...
  //    */
  //   //check if this card is already at it's min-width
  //   if(this.get('model.width') > this.get('minWidth')){
  //     //Close to the left
  //     if(mousePos.x > card.left && mousePos.x < (card.left + xProximity) ){
  //
  //       dropTargetModel = {
  //         "top":card.top + inset,
  //         "left":card.left + inset,
  //         "height":card.height - (2 * inset),
  //         "width":"4"
  //       };
  //       insertAfter = false;
  //     }
  //
  //     //Close to the right
  //     if(mousePos.x > ( card.right - xProximity)  && mousePos.x < card.right )  {
  //
  //       dropTargetModel = {
  //         "top":card.top + inset,
  //         "left":card.right - inset,
  //         "height":card.height - (2 * inset),
  //         "width":4
  //       };
  //       insertAfter = true;
  //     }
  //   }
  //   //Close to the top
  //   //console.log( 'card.top:' + card.top + ' y: ' + mousePos.y +' prx: ' + (card.top + proximity));
  //   // if(mousePos.y > card.top && mousePos.y < (card.top + yProximity) ){
  //   //
  //   //   crackcss = {
  //   //     "display":"block",
  //   //     "background-color":"purple",
  //   //     "top":card.top + inset,
  //   //     "left":card.left + inset,
  //   //     "height":"4px",
  //   //     "width":card.width - (2 * inset)
  //   //   };
  //   //   insertAfter = false;
  //   // }
  //   //
  //   // //Close to the bottom
  //   // if(mousePos.y > (card.bottom - yProximity) && mousePos.y < (card.bottom) ){
  //   //
  //   //   crackcss = {
  //   //     "display":"block",
  //   //     "background-color":"navy",
  //   //     "top":card.bottom + inset,
  //   //     "left":card.left + inset,
  //   //     "height":"4px",
  //   //     "width":card.width - (2 * inset)
  //   //   };
  //   //   insertAfter = true;
  //   // }
  //
  //   if(dropTargetModel){
  //     this.get('layoutCoordinator').trigger('showDropTarget', dropTargetModel);
  //   }
  //   // set target card and before/after
  //   // TODO: change to .transferData.
  //   this.set('layoutCoordinator.dropCardInfo', {
  //     card: this.get('model'),
  //     insertAfter:insertAfter
  //   });
  //   this.set('layoutCoordinator.transferData.action', td.dragType + '-card');
  // },
  //
  //
  // /**
  //  * When something leaves the component...
  //  * - hide the crack
  //  */
  // dragLeave(event){
  //   if(!this.get('ignoreNextLeave')) {
  //     //Ember.$('.crack').css({display:"none"});
  //     this.get('layoutCoordinator').trigger('hideDropTarget');
  //   }else{
  //     this.set('ignoreNextLeave', false);
  //   }
  // },


  mouseEnter(/*event*/){
    if(!this.get('layoutEditor.draggingProperties')){
      //console.log('mouseEnter: showControls for ' + this.get('elementId'));
      this.get('layoutCoordinator').trigger( 'showControls' , this );
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
      if(!this.get('layoutEditor.draggingProperties')){
        console.log('mouseLeave: hideControls for ' + this.get('elementId'));
        this.get('layoutCoordinator').trigger( 'hideControls' , this );
      }
    }
  },

  mouseMove(event){
    //if we don't have a drag operation underway...
    if(!this.get('layoutEditor.draggingProperties')){
      //we determine if we are close enough to show the resizer
      //if we are close to an edge, show the resizer
      let mousePos = {
        x: event.clientX + window.pageXOffset,
        y: event.clientY + window.pageYOffset
      };
      let componentPosition = this.get('componentPosition');
      let resizerProximity = 30;
      let resizerVisible = false;
      let edge = '';
      //check if we are close to a resizable edge
      if(mousePos.y > (componentPosition.top + 50) && mousePos.y < (componentPosition.bottom - 50)){

        if(mousePos.x > componentPosition.left && mousePos.x < (componentPosition.left + resizerProximity)){
          //send event info up to the bs-row-editor which actually handles showing the resizer
          this.sendAction('onShowCardResize', this.get('model'), 'left', componentPosition);
          edge = 'left';
          resizerVisible = true;
        }

        if(mousePos.x < componentPosition.right && mousePos.x > (componentPosition.right - resizerProximity)){
          //send event info up
          this.sendAction('onShowCardResize', this.get('model'), 'right', componentPosition);
          edge = 'right';
          resizerVisible = true;
        }
      }
      //console.log('BS-CARD-EDITOR:mouseMove canResize: ' + resizerVisible);

      this.sendAction('onUpdateCardResizer', {
        card: this.get('model'),
        visible: resizerVisible,
        edge: edge,
        cardPosition: componentPosition
      });
    }
  },




  /**
   * Component Position
   * ,top,bottom,right,left,height,width of this component
   * Marked Volatile so it's recomputed when requested
   */
  componentPosition: Ember.computed('model.width', function(){
    return this.getComponentPosition();
  }).volatile(),//

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


  removeCard(){
    this.sendAction('onCardRemove', this.get('model'));
  },

  actions: {
    onModelChanged() {

    },
    removeCard(){
      Ember.debug('bscard-editor:removeCard...');
      this.removeCard();
      //this.destroy();
    },
    editCard() {
      Ember.debug('bscard-editor:editCard...');
      this.sendAction('onCardEdit', this.get('model'));
    }
  }
});
