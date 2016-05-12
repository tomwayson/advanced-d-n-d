import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['card-drop-targets'],
  classNameBindings: ['invisible'],
  attributeBindings:['style'],
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  invisible: true,
  componentPosition:null,
  cardComponent:null,
  style:'',
  targetContainerStyle:'',
  dockMessage: '',
  init(){

    this._super(...arguments);
    //add handlers for layoutCoordinator events
    this.get('layoutCoordinator').on('showCardDropTargets', Ember.run.bind(this, this.showCardDropTargets));
    this.get('layoutCoordinator').on('hideCardDropTargets', Ember.run.bind(this, this.hideCardDropTargets));
  },
  willDestroyElement(){
    this.get('layoutCoordinator').off('showCardDropTargets', this.showCardDropTargets);
    this.get('layoutCoordinator').off('hideCardDropTargets', this.hideCardDropTargets);
  },
  showCardDropTargets(cardComponent){
    console.log('starting to show droptargets');
    if(cardComponent){
      this.set('cardComponent', cardComponent);
    }
    this.updateTargetStyle( cardComponent.get('componentPosition') );
    this.set('invisible', false);
  },
  hideCardDropTargets(){
    //console.log('card-controls caught hideControls event');
    this.updateTargetStyle( null );
    this.set('invisible', true);
  },
  updateTargetStyle(componentPosition){
    let styleString = Ember.String.htmlSafe('');
    let pos = componentPosition;
    if(pos){
      styleString = Ember.String.htmlSafe('top:' + pos.top + 'px; left:' + pos.left + 'px;height:' + pos.height+ 'px;width:' + pos.width + 'px;');
    }
    //console.log('card-controls style string: ' + styleString);
    this.set('targetContainerStyle',  styleString);
  },
  updatePreviewStyle(dockPosition){
    let styleString = Ember.String.htmlSafe('display:none;');
    if(dockPosition){
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
        styleString = Ember.String.htmlSafe('top:' + pos.top + 'px; left:' + left + 'px;height:'+pos.height+'px;width:'+width+'px;');
      }
    }
    this.set('previewStyle', styleString);
  },
  actions: {
    updateDockingTarget(dockPosition){
      console.log('DockPosition ', dockPosition);
      this.updatePreviewStyle(dockPosition);
    }
  }


});
