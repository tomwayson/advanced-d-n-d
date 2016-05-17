/**
 * empty-section-drop-target/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['empty-section-drop-target'],
  attributeBindings:['style'],
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  sectionComponent:null,
  targetContainerStyle:'',
  hasDockingTarget: Ember.computed.notEmpty('dockingTarget'),
  dockingTarget: Ember.computed.alias('layoutCoordinator.draggingProperties.dockingTarget'),

  init(){
    this._super(...arguments);
    //add handlers for layoutCoordinator events
    this.get('layoutCoordinator').on('showEmptySectionDropTarget', Ember.run.bind(this, this.showEmptySectionDropTarget));
  },
  willDestroyElement(){
    this.get('layoutCoordinator').off('showEmptySectionDropTarget', this.showEmptySectionDropTarget);
  },

  showEmptySectionDropTarget(sectionComponent){
    if(sectionComponent){
      this.set('sectionComponent', sectionComponent);
      this.updateTargetStyle(sectionComponent.get('componentPosition'));
    }else{
      this.set('sectionComponent',null);
      this.updateTargetStyle( null );
    }
  },

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
      if(this.get('layoutCoordinator.draggingProperties')){
        console.log('empty-section-drop-target setting dropTargetName to ' + dockTargetName)
        this.set('layoutCoordinator.draggingProperties.dockingTarget', dockTargetName);
      }
    }
  }

});
