/**
 * bs-card-editor/component.js
 */
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

  init(){
    this._super(...arguments);
    //add this to the layoutCoordinatior
    this.get('layoutCoordinator').cardComponents.push(this);
  },
  willDestroyElement(){
    //remove the component from the hash
    this.set('layoutCoordinator.cardComponents', this.get('layoutCoordinator.cardComponents').without(this));
  },


  mouseEnter(/*event*/){
    //console.log('bs-card-editor mouseEnter...');
    if(!this.get('layoutCoordinator.draggingProperties')){
      this.get('layoutCoordinator').trigger( 'showControls' , this );
    }
  },

  mouseLeave(event){
    //console.log('bs-card-editor mouseleave...');
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
        this.get('layoutCoordinator').trigger( 'showControls' );
      }
    }
  },

  mouseMove(event){
    //console.log('bs-card-editor mouseMove...');
    //if we don't have a drag operation underway...
    if(!this.get('layoutCoordinator.draggingProperties')){
      //we determine if we are close enough to show the resizer
      //if we are close to an edge, show the resizer
      let mousePos = {
        x: event.clientX + window.pageXOffset,
        y: event.clientY + window.pageYOffset
      };
      let componentPosition = this.get('componentPosition');
      let resizerProximity = 50;
      let resizerOptions = null;
      //check if we are close to a resizable edge
      if(mousePos.y > (componentPosition.top + 50) && mousePos.y < (componentPosition.bottom - 50)){
        //Left-edge
        if(mousePos.x > componentPosition.left && mousePos.x < (componentPosition.left + resizerProximity)){
          resizerOptions = {edge:'left', component: this};
        }
        //Right-edge
        if(mousePos.x < componentPosition.right && mousePos.x > (componentPosition.right - resizerProximity)){
          resizerOptions = {edge:'right', component: this};
        }
      }
      this.get('layoutCoordinator').trigger('showCardResizer', resizerOptions );
    }else{
      //TODO: Do we need to hide it?
      console.log('bs-card-editor layoutCoordinator.draggingProperties is not null...');
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
