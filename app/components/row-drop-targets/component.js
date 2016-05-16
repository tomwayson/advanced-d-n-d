/**
 * row-drop-targets/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['row-drop-targets'],
  attributeBindings:['style'],
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  rowComponent:null,
  targetContainerStyle:'',
  hasDockingTarget: Ember.computed.notEmpty('dockingTarget'),
  dockingTarget: Ember.computed.alias('layoutCoordinator.draggingProperties.dockingTarget'),

  init(){
    this._super(...arguments);
    //add handlers for layoutCoordinator events
    this.get('layoutCoordinator').on('showRowDropTargets', Ember.run.bind(this, this.showRowDropTargets));
  },
  willDestroyElement(){
    this.get('layoutCoordinator').off('showRowDropTargets', this.showRowDropTargets);
  },

  showRowDropTargets(rowComponent){
    if(rowComponent){
      this.set('rowComponent', rowComponent);
      this.updateTargetStyle(rowComponent.get('componentPosition'));
    }else{
      this.set('rowComponent',null);
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
        console.log('row-drop-targets setting dropTargetName to ' + dockTargetName)
        this.set('layoutCoordinator.draggingProperties.dockingTarget', dockTargetName);
      }
    }
  }

});
