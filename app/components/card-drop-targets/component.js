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
      if(this.get('layoutCoordinator.draggingProperties')){
        this.set('layoutCoordinator.draggingProperties.dockingTarget', dockTargetName);
      }

    }
  }
});
