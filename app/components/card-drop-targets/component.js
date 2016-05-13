/**
 * card-drop-target/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['card-drop-targets'],
  classNameBindings: ['invisible'],
  attributeBindings:['style'],
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  invisible: true,
  cardComponent:null,
  targetContainerStyle:'',//move to computed property

  hasDockingTarget: Ember.computed.notEmpty('dockingTarget'),
  draggingPosition: Ember.computed.alias('layoutEditor.draggingProperties.mousePosition'),

  dockMessage: '',

  init(){
    this._super(...arguments);
    //add handlers for layoutCoordinator events
    this.get('layoutCoordinator').on('showCardDropTargets', Ember.run.bind(this, this.showCardDropTargets));
    //this.get('layoutCoordinator').on('hideCardDropTargets', Ember.run.bind(this, this.hideCardDropTargets));
  },
  willDestroyElement(){
    this.get('layoutCoordinator').off('showCardDropTargets', this.showCardDropTargets);
    //this.get('layoutCoordinator').off('hideCardDropTargets', this.hideCardDropTargets);
  },
  showCardDropTargets(cardComponent){
    if(cardComponent){
      this.set('cardComponent', cardComponent);
      this.updateTargetStyle( cardComponent.get('componentPosition') );
    }else{
      this.updateTargetStyle( null );
    }

  },
  // hideCardDropTargets(){
  //   this.updateTargetStyle( null );
  // },

  /**
   * Set the style of the drop-targes
   */
  updateTargetStyle(componentPosition){
    let styleString = Ember.String.htmlSafe('displayt:none;');
    let pos = componentPosition;
    if(pos){
      styleString = Ember.String.htmlSafe('top:' + pos.top + 'px; left:' + pos.left + 'px;height:' + pos.height+ 'px;width:' + pos.width + 'px;');
    }
    //console.log('card-controls style string: ' + styleString);
    this.set('targetContainerStyle',  styleString);
  },

  /**
   * The .preview does double duty as the box shown during drag operations
   * as well as the box that shows the drop-location
   */
  previewStyle:Ember.computed('dockingTarget','draggingPosition', function(){
    console.log('previewStyle re-computed ' +  Date.now());
    let styleString = Ember.String.htmlSafe('display:none;');
    let dockPosition = this.get('dockingTarget');

    if(dockPosition){
      //if we are over a drop-target, then we transform
      //the .preview to show where the element will drop
      let pos = this.get('cardComponent.componentPosition');
      if(pos){
        let left = pos.left;
        let width = pos.width / 2;
        if(dockPosition === 'right'){
          this.set('dockMessage', this.get('dockRightMessage'));
          left = pos.left + width;
        }else{
          this.set('dockMessage', this.get('dockLeftMessage'));
        }
        styleString = Ember.String.htmlSafe(`top:${pos.top}px; left:${left}px;height:${pos.height}px;width:${width}px;`);
      }

    }else{
      //we are dragging, so set the style to be the drag box
      this.set('dockMessage', this.get('dragMessage'));
      let draggedElement = this.get('layoutEditor.draggingProperties.sourceLayoutElement');
      if (!draggedElement) {
        return Ember.String.htmlSafe('visibility: hidden;');
      }
      this.set('invisible', false);
      let draggingPosition = this.get('draggingPosition');
      styleString = Ember.String.htmlSafe(`left:${draggingPosition.left}px;top:${draggingPosition.top}px;`);
    }
    return styleString;
  }),

  actions: {
    /**
     * fires on mouseEnter & mouseLeave for the targets
     */
    updateDockingTarget(dockTarget){

      this.set('dockingTarget',dockTarget )
      //this.updatePreviewStyle(dockPosition);
    }
  }


});
