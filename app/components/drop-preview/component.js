/**
 * drop-preview/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['drop-preview'],
  attributeBindings:['style'],
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  cardComponent:null,
  hasDockingTarget: Ember.computed.notEmpty('layoutCoordinator.draggingProperties.dockingTarget'),
  dockingTarget: Ember.computed.alias('layoutCoordinator.draggingProperties.dockingTarget'),
  draggingPosition: Ember.computed.alias('layoutCoordinator.draggingProperties.mousePosition'),
  dockMessage: '',

  // init(){
  //   this._super(...arguments);
  //   //add handlers for layoutCoordinator events
  //   this.get('layoutCoordinator').on('showDropPreview', Ember.run.bind(this, this.showDropPreview));
  // },
  // willDestroyElement(){
  //   this.get('layoutCoordinator').off('showDropPreview', this.showDropPreview);
  // },



  /**
   * The .preview does double duty as the box shown during drag operations
   * as well as the box that shows the drop-location
   */
  previewStyle:Ember.computed('dockingTarget','draggingPosition', function(){
    //console.log('previewStyle re-computed ' +  Date.now());
    let styleString = Ember.String.htmlSafe('display:none;');
    let dockTarget = this.get('dockingTarget');

    //if we have a dropTarget, then we transform
    //the .preview to show where the element will drop
    if(dockTarget){

      //set the target on the draggingProperties
      if(this.get('layoutCoordinator.draggingProperties')){
        this.set('layoutCoordinator.draggingProperties.dockTarget', dockTarget);
      }

      let pos, top,left,height,width;

      switch(dockTarget){
        case 'card-right':
          this.set('dockMessage', this.get('dockRightMessage'));
          this.set('layoutCoordinator.draggingProperties.dropTargetType', 'card');
          pos = this.get('layoutCoordinator.draggingProperties.targetCard.componentPosition');
          top=pos.top;
          height=pos.height;
          width = pos.width / 2;
          left = pos.left + width;
          break;

        case 'card-left':
          this.set('dockMessage', this.get('dockLeftMessage'));
          this.set('layoutCoordinator.draggingProperties.dropTargetType', 'card');
          pos = this.get('layoutCoordinator.draggingProperties.targetCard.componentPosition');
          top=pos.top;
          height=pos.height;
          width = pos.width / 2;
          left=pos.left;
          break;

        case 'row-top':
          this.set('dockMessage', this.get('dockTopMessage'));
          this.set('layoutCoordinator.draggingProperties.dropTargetType', 'row');
          pos = this.get('layoutCoordinator.draggingProperties.targetRow.componentPosition');
          top=pos.top;
          height = pos.height / 2;
          width = pos.width;
          left=pos.left;
          break;

        case 'row-bottom':
          this.set('dockMessage', this.get('dockBottomMessage'));
          this.set('layoutCoordinator.draggingProperties.dropTargetType', 'row');
          pos = this.get('layoutCoordinator.draggingProperties.targetRow.componentPosition');
          height = pos.height / 2;
          top = pos.bottom - height;
          width = pos.width;
          left=pos.left;
          break;

        case 'section-empty':
          this.set('dockMessage', this.get('emptySectionMessage'));
          this.set('layoutCoordinator.draggingProperties.dropTargetType', 'section');
          pos = this.get('layoutCoordinator.draggingProperties.targetSection.componentPosition');
          top=pos.top;
          height=pos.height;
          width = pos.width;
          left=pos.left;
          break;
      }

      styleString = Ember.String.htmlSafe(`top:${top}px; left:${left}px;height:${height}px;width:${width}px;`);

    }else{

      //switch to the dragging message
      this.set('dockMessage', this.get('dragMessage'));

      let draggingPosition = this.get('draggingPosition');
      if(draggingPosition){
        styleString = Ember.String.htmlSafe(`left:${draggingPosition.left}px;top:${draggingPosition.top}px;`);
      }
    }

    return styleString;
  })

});
