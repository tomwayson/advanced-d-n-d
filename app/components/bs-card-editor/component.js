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
  // properties used in the drag and drop
  dragType:'card',    //always a card...
  dragAction:'move',  //always a move

  controlsVisible: false,

  layoutCoordinator: Ember.inject.service('layout-coordinator'),

  ignoreNextLeave:false,

  init(){
    this._super(...arguments);
    //add this to the layoutCoordinatior
    this.get('layoutCoordinator').components.push(this);
  },
  willDestroyElement(){
    //remove the component from the hash
    this.set('layoutCoordinator.components', this.get('layoutCoordinator.components').without(this));
  },

  mouseEnter(/*event*/){
    if(!this.get('layoutCoordinator.draggingProperties')){
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
      if(!this.get('layoutCoordinator.draggingProperties')){
        this.get('layoutCoordinator').trigger( 'hideControls' , this );
      }
    }
  },

  mouseMove(event){
    //if we don't have a drag operation underway...
    if(!this.get('layoutCoordinator.draggingProperties')){
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

    removeCard(){
      Ember.debug('bscard-editor:removeCard...');
      this.removeCard();
    },
    editCard() {
      Ember.debug('bscard-editor:editCard...');
      this.sendAction('onCardEdit', this.get('model'));
    }
  }
});
