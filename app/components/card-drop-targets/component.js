/**
 * card-drop-target/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['card-drop-targets'],
  attributeBindings:['style'],
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  cardComponent:null,
  targetContainerStyle:'',
  hasDockingTarget: Ember.computed.notEmpty('layoutCoordinator.draggingProperties.dockingTarget'),
  dockingTarget: Ember.computed.alias('layoutCoordinator.draggingProperties.dockingTarget'),

  dockMessage: '',

  init(){
    this._super(...arguments);
    //add handlers for layoutCoordinator events
    this.get('layoutCoordinator').on('showCardDropTargets', Ember.run.bind(this, this.showCardDropTargets));
  },
  willDestroyElement(){
    this.get('layoutCoordinator').off('showCardDropTargets', this.showCardDropTargets);
  },

  showCardDropTargets(cardComponent){
    if(cardComponent){
      this.set('cardComponent', cardComponent);
      this.updateTargetStyle( cardComponent.get('componentPosition') );
    }else{
      this.set('cardComponent',null);
      this.updateTargetStyle( null );
    }
  },

  // targetContainerStyle:Ember.computed('cardComponent', function(){
  //   let styleString = Ember.String.htmlSafe('display:none;');
  //   let card = this.get('cardComponent');
  //   if(card){
  //     let pos = card.componentPosition;
  //     if(pos){
  //       styleString = Ember.String.htmlSafe('top:' + pos.top + 'px; left:' + pos.left + 'px;height:' + pos.height+ 'px;width:' + pos.width + 'px;');
  //     }
  //   }
  //   return styleString;
  // }),
  /**
   * Set the style of the drop-targets
   * Tried to do this via computed property
   * but it did not seem to work.
   */
  updateTargetStyle(componentPosition){
    let styleString = Ember.String.htmlSafe('display:none;');
    let pos = componentPosition;
    if(pos){
      styleString = Ember.String.htmlSafe('top:' + pos.top + 'px; left:' + pos.left + 'px;height:' + pos.height+ 'px;width:' + pos.width + 'px;');
    }
    this.set('targetContainerStyle',  styleString);
  },

  actions: {
    /**
     * fires on mouseEnter & mouseLeave for the targets
     */
    updateDockingTarget(dockTargetName){
      //this.set('dockingTarget', dockTargetName );
      this.set('layoutCoordinator.draggingProperties.dockingTarget', dockTargetName);
      //this.get('layoutCoordinator').trigger('showDropPreview', dockTargetName, this.get('cardComponent.componentPosition'));
    }
  }

  /**
   * The .preview does double duty as the box shown during drag operations
   * as well as the box that shows the drop-location
   */
  // previewStyle:Ember.computed('dockingTarget','draggingPosition', function(){
  //   //console.log('previewStyle re-computed ' +  Date.now());
  //   let styleString = Ember.String.htmlSafe('display:none;');
  //   let dockTargetName = this.get('dockingTarget');
  //
  //   if(dockTargetName){
  //     //we are dragging, so set the style to be the drag box
  //     //Clear the target component on the draggingProperties
  //     if(this.get('layoutCoordinator.draggingProperties')){
  //       this.set('layoutCoordinator.draggingProperties.dockTargetName', dockTargetName);
  //       this.set('layoutCoordinator.draggingProperties.dropTargetType', 'card');
  //     }
  //     //if we are over a drop-target, then we transform
  //     //the .preview to show where the element will drop
  //     let pos = this.get('cardComponent.componentPosition');
  //
  //     if(pos){
  //       //have to handle top/bottom as well as left/right
  //       //BUT we can't use this single position as the top/bottom
  //       //will be a row or section vs a card.
  //       let left = pos.left;
  //       let width = pos.width / 2;
  //       if(dockTargetName === 'right'){
  //         this.set('dockMessage', this.get('dockRightMessage'));
  //         left = pos.left + width;
  //       }else{
  //         this.set('dockMessage', this.get('dockLeftMessage'));
  //       }
  //       styleString = Ember.String.htmlSafe(`top:${pos.top}px; left:${left}px;height:${pos.height}px;width:${width}px;`);
  //     }
  //
  //   }else{
  //
  //     //switch to the dragging message
  //     this.set('dockMessage', this.get('dragMessage'));
  //
  //     let draggingPosition = this.get('draggingPosition');
  //     if(draggingPosition){
  //       styleString = Ember.String.htmlSafe(`left:${draggingPosition.left}px;top:${draggingPosition.top}px;`);
  //     }
  //   }
  //   return styleString;
  // }),




});
