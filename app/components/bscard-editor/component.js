import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['card-editor'],
  classNameBindings:['bootstrapGridClass'],

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

  didInsertElement() {
    this._super(...arguments);
    // b/c we're dragging from upper right corner,
    // want to shift to the left by width of the element
    // TODO: probably want to set drag image offset x/y dynamically
    // to account for mouse position over handle
    const $el = this.$();
    this.set('dragImage', $el[0]);
    this.set('dragImageOffsetX', $el.outerWidth());
  },

  dragEnter(event){

    let td = this.get('eventBus.transferData');
    //console.info('DRAGENTER ON CARD ' + this.get('elementId') + ' for ' + td.type);

    //preventDefault for valid objects of correct type
    // if(td.type === 'card'){
    //   event.preventDefault();
    // }
    //console.log("Drag Enter: ID: " + this.get('elementId') + ' ClassNames: ' +event.currentTarget.className );
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
    //low-level DOM api for-the-win
    let card = componentElement.getBoundingClientRect();
    //console.info('RAW: top: ' + card.top + ' bottom: ' + card.bottom + ' scy: ' + window.scrollY + ' H: ' + (card.bottom - card.top) );
    //this.set('componentPosition',card);
    //TODO: Ensure this works in target browsers
    let cp = {
      top: card.top + window.scrollY,
      left: card.left + window.scrollX,
      bottom: card.bottom + window.scrollY,
      right: card.right + window.scrollX,
      width: card.width,
      height: card.height
    };
    this.set('componentPosition', cp);
    //console.info('FIXED: top: ' + cp.top + ' bottom: ' + cp.bottom + ' CH:' + (cp.bottom - cp.top) + ' H:' + cp.height);
  },

  /**
   * When something is dropped on a card,
   * hide the crack drop-indicator
   */
  drop(event){
    let td = this.get('eventBus.transferData');
    //console.log('DROP ON CARD fired for ' + td.type);
    Ember.$('.crack').css({display:"none"});
  },

  dragOver(event){
    let td = this.get('eventBus.transferData');

    //get the x,y from the event
    let mousePos = {
      x: event.originalEvent.clientX + window.scrollX,
      y: event.originalEvent.clientY + window.scrollY
    };

    //get the card rectangle
    let card = this.get('componentPosition');

    //console.info('Card: top: ' + card.top + ' cY: ' + mousePos.y + ' bottom: ' + card.bottom + ' left: ' + card.left + ' cX: ' + mousePos.x +' Right: ' + card.right);

    //when you are within 1/4 of the dimension
    let xProximity = card.width / 3;
    let yProximity = card.height / 3;
    let inset = 10;
    //default crack css
    let crackcss = {
      display:"none"
    };
    // insert before or after this card? default to after
    let insertAfter = false;

    /**
     * Determine if we are close to an edge...
     */
    //check if this card is already at it's min-width
    if(this.get('model.width') > this.get('minWidth')){
      //Close to the left
      if(mousePos.x > card.left && mousePos.x < (card.left + xProximity) ){

        crackcss = {
          "display":"block",
          "background-color":"#666666",
          "top":card.top + inset,
          "left":card.left + inset,
          "height":card.height - (2 * inset),
          "width":"4px"
        };
        insertAfter = false;
      }

      //Close to the right
      if(mousePos.x > ( card.right - xProximity)  && mousePos.x < card.right )  {

        crackcss = {
          "display":"block",
          "background-color":"#666666",
          "top":card.top + inset,
          "left":card.right - inset,
          "height":card.height - (2 * inset),
          "width":"4px"
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
    //set the crack css
    Ember.$('.crack').css(crackcss);
    // set target card and before/after
    // TODO: change to .transferData.
    this.set('eventBus.dropCardInfo', {
      card: this.get('model'),
      insertAfter:insertAfter
    });
    this.set('eventBus.transferData.action', td.dragType + '-card');
  },

  dragLeave(event){

    //console.log('DRAG LEAVE ON CARD : event.target.className: ' + event.target.className);
    if(!this.get('ignoreNextLeave')) {
      this.set('dropTargetClass', '');

    }else{
      this.set('ignoreNextLeave', false);
    }
  },

  /**
   * Resize Mouse Actions
   */
  mouseDown(event){
    console.log('BSCARDEDITOR mouseDown...' );
  },

  mouseUp(event){
    console.log('BSCARDEDITOR mouseUp...' );
  },

  mouseMove(event){
    //Scenarios
    //- if both cards.width > min-width
    //  - show bi-directional
    //- if right-card = min-width
    //  - show left-only splitter
    //- if left-card = min-width
    //  - show right-only splitter
    //- if both cards = min-width
    //  - show no-resize splitter

    //if we are close to an edge, show the resizer
    let mousePos = {
      x: event.clientX + window.scrollX,
      y: event.clientY + window.scrollY
    };
    let componentPosition = this.getComponentPosition(Ember.$(event.target));

    let resizerProximity = 10;
  
    //check if we are close to a splitable edge
    if(mousePos.x > componentPosition.left && mousePos.x < (componentPosition.left + resizerProximity)){
      //send event info up
      this.sendAction('onShowCardResize', this.get('model'), 'left', componentPosition);
    }

    if(mousePos.x < componentPosition.right && mousePos.x > (componentPosition.right - resizerProximity)){
      //send event info up
      this.sendAction('onShowCardResize', this.get('model'), 'right', componentPosition);
    }


  },

  mouseEnter(event){
    //console.log('BSCARDEDITOR mouseEnter...' );
    //ensure we have componentPosition

  },

  mouseLeave(event){
    console.log('BSCARDEDITOR mouseLeave...' );
  },

  getComponentPosition($el){

    if(!this.get('componentPosition')){
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
      //low-level DOM api for-the-win
      let card = componentElement.getBoundingClientRect();
      //console.info('RAW: top: ' + card.top + ' bottom: ' + card.bottom + ' scy: ' + window.scrollY + ' H: ' + (card.bottom - card.top) );
      //this.set('componentPosition',card);
      //TODO: Ensure this works in target browsers
      let cp = {
        top: card.top + window.scrollY,
        left: card.left + window.scrollX,
        bottom: card.bottom + window.scrollY,
        right: card.right + window.scrollX,
        width: card.width,
        height: card.height
      };
      this.set('componentPosition', cp);
      return cp;
    }else{
      return this.get('componentPosition');
    }
  },

  actions: {
    onModelChanged() {

    },
    onDragStart() {
      this.sendAction('onCardDrag');
    },
    deleteCard(){
      Ember.debug('bscard-editor:deleteCard...');
      this.sendAction('onCardDelete', this.get('model'));
      //this.destroy();
    },

  }
});
