/**
 * card-controls/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['card-controls-container'],
  classNameBindings: ['invisible'],
  attributeBindings:['style'],
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  invisible: Ember.computed.not('visible'),
  componentPosition:null,
  sectionComponent:null,
  style:'',

  init(){

    this._super(...arguments);
    //add handlers for layoutCoordinator events
    this.get('layoutCoordinator').on('showControls', Ember.run.bind(this, this.showControls));

  },
  willDestroyElement(){
    this.get('layoutCoordinator').off('showControls', this.showControls);

  },
  showControls(cardComponent){
    this.set('cardComponent', cardComponent);
    if(cardComponent){
      this.updateStyle( cardComponent.get('componentPosition') );
      this.set('invisible', false);
    }else{
      this.updateStyle( null );
      this.set('invisible', true);
    }
  },
  updateStyle(componentPosition){
    let styleString = Ember.String.htmlSafe('');
    let pos = componentPosition;

    if(pos){
      let lf = pos.left + 10;
      let tp = pos.top + 10;
      styleString = Ember.String.htmlSafe('top:' + tp + 'px; left:' + lf + 'px;');
    }
    this.set('style',  styleString);
  },
  mouseEnter() {
    //show the hilight around the current card
    if(this.get('cardComponent')){
      this.set('cardComponent.highlight', true);
    }
  },
  mouseLeave() {
    //hide the hilight
    if(this.get('cardComponent.highlight')){
      this.set('cardComponent.highlight', false);
    }
  },
  actions: {
    removeCard(){
      this.updateStyle();
      this.get('cardComponent').removeCard();
    },
    editCard(){
      this.sendAction('onEditCard', this.get('cardComponent.model'));
    }
  }
});
